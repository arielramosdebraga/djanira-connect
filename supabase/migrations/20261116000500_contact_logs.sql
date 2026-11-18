create table if not exists public.contact_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  follow_up_id uuid references public.follow_ups(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'manual')),
  contacted_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists contact_logs_customer_date_idx on public.contact_logs(organization_id, customer_id, contacted_at desc);
create index if not exists contact_logs_follow_up_idx on public.contact_logs(follow_up_id);

alter table public.contact_logs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'contact_logs' and policyname = 'members can read contact logs') then
    create policy "members can read contact logs" on public.contact_logs for select using (public.is_active_member(organization_id));
  end if;
end;
$$;

create or replace function public.record_follow_up_contact(p_follow_up_id uuid, p_notes text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_customer_id uuid;
  v_status text;
begin
  select organization_id, customer_id, status into v_organization_id, v_customer_id, v_status
  from public.follow_ups where id = p_follow_up_id for update;
  if v_organization_id is null or not public.is_active_member(v_organization_id) then raise exception 'Retorno sem acesso'; end if;
  if v_status not in ('pending', 'postponed') then raise exception 'Retorno não está pendente'; end if;

  update public.follow_ups set status = 'contacted', contacted_at = now(), contacted_by = v_user_id, updated_at = now() where id = p_follow_up_id;
  insert into public.contact_logs (organization_id, customer_id, follow_up_id, channel, created_by, notes) values (v_organization_id, v_customer_id, p_follow_up_id, 'whatsapp', v_user_id, nullif(trim(p_notes), ''));
  update public.customers set last_contact_at = now(), updated_at = now() where id = v_customer_id and organization_id = v_organization_id;
end;
$$;

create or replace function public.postpone_follow_up(p_follow_up_id uuid, p_next_date date)
returns void language plpgsql security definer set search_path = public as $$
declare v_organization_id uuid; v_status text;
begin
  select organization_id, status into v_organization_id, v_status from public.follow_ups where id = p_follow_up_id for update;
  if v_organization_id is null or not public.is_active_member(v_organization_id) then raise exception 'Retorno sem acesso'; end if;
  if v_status not in ('pending', 'postponed') then raise exception 'Retorno não está pendente'; end if;
  update public.follow_ups set next_follow_up_date = p_next_date, status = 'postponed', updated_at = now() where id = p_follow_up_id;
end;
$$;

create or replace function public.dismiss_follow_up(p_follow_up_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_organization_id uuid; v_status text;
begin
  select organization_id, status into v_organization_id, v_status from public.follow_ups where id = p_follow_up_id for update;
  if v_organization_id is null or not public.is_active_member(v_organization_id) then raise exception 'Retorno sem acesso'; end if;
  if v_status not in ('pending', 'postponed') then raise exception 'Retorno não está pendente'; end if;
  update public.follow_ups set status = 'dismissed', updated_at = now() where id = p_follow_up_id;
end;
$$;

revoke all on function public.record_follow_up_contact(uuid, text) from public;
grant execute on function public.record_follow_up_contact(uuid, text) to authenticated;
revoke all on function public.postpone_follow_up(uuid, date) from public;
grant execute on function public.postpone_follow_up(uuid, date) to authenticated;
revoke all on function public.dismiss_follow_up(uuid) from public;
grant execute on function public.dismiss_follow_up(uuid) to authenticated;

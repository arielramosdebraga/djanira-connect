create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  break_start time,
  break_end time,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, weekday),
  check (end_time > start_time),
  check ((break_start is null and break_end is null) or (break_start >= start_time and break_end <= end_time and break_end > break_start))
);

create index if not exists availability_rules_organization_idx on public.availability_rules(organization_id, weekday);
alter table public.availability_rules enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'availability_rules' and policyname = 'members can read availability') then
    create policy "members can read availability" on public.availability_rules for select using (public.is_active_member(organization_id));
  end if;
end;
$$;

create or replace function public.save_availability_rules(p_organization_id uuid, p_rules jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_organization_role(p_organization_id, 'admin') then raise exception 'Usuário sem permissão administrativa'; end if;
  delete from public.availability_rules where organization_id = p_organization_id;
  insert into public.availability_rules (organization_id, weekday, start_time, end_time, break_start, break_end, active)
  select p_organization_id, (rule->>'weekday')::smallint, (rule->>'startTime')::time, (rule->>'endTime')::time, nullif(rule->>'breakStart', '')::time, nullif(rule->>'breakEnd', '')::time, true
  from jsonb_array_elements(p_rules) rule;
end;
$$;

revoke all on function public.save_availability_rules(uuid, jsonb) from public;
grant execute on function public.save_availability_rules(uuid, jsonb) to authenticated;

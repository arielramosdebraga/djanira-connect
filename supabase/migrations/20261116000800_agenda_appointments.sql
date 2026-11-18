create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  service_id uuid not null references public.services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  notes text,
  created_by uuid not null references auth.users(id),
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users(id),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, idempotency_key),
  check (ends_at > starts_at)
);

create index if not exists appointments_schedule_idx on public.appointments(organization_id, starts_at, status);
create index if not exists appointments_customer_idx on public.appointments(organization_id, customer_id, starts_at desc);
alter table public.appointments enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'appointments' and policyname = 'members can read appointments') then
    create policy "members can read appointments" on public.appointments for select using (public.is_active_member(organization_id));
  end if;
end;
$$;

create or replace function public.create_appointment(
  p_organization_id uuid,
  p_customer_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_notes text,
  p_idempotency_key text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_existing uuid;
  v_duration integer;
  v_ends_at timestamptz;
  v_timezone text;
  v_weekday integer;
  v_start_time time;
  v_end_time time;
  v_break_start time;
  v_break_end time;
begin
  if v_user_id is null or not public.is_active_member(p_organization_id) then raise exception 'Usuário sem acesso à organização'; end if;
  select id into v_existing from public.appointments where organization_id = p_organization_id and idempotency_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;
  select timezone into v_timezone from public.organizations where id = p_organization_id;
  select duration_minutes into v_duration from public.services where id = p_service_id and organization_id = p_organization_id and active = true;
  if v_duration is null then raise exception 'Serviço inválido ou inativo'; end if;
  if not exists (select 1 from public.customers where id = p_customer_id and organization_id = p_organization_id and status = 'active') then raise exception 'Contato inválido ou arquivado'; end if;
  v_ends_at := p_starts_at + make_interval(mins => v_duration);
  v_weekday := extract(dow from (p_starts_at at time zone coalesce(v_timezone, 'America/Sao_Paulo')));
  select start_time, end_time, break_start, break_end into v_start_time, v_end_time, v_break_start, v_break_end from public.availability_rules where organization_id = p_organization_id and weekday = v_weekday and active = true;
  if not found then raise exception 'Não há atendimento configurado para esse dia'; end if;
  if (p_starts_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time < v_start_time or (v_ends_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time > v_end_time then raise exception 'Horário fora do período de atendimento'; end if;
  if v_break_start is not null and (p_starts_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time < v_break_end and (v_ends_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time > v_break_start then raise exception 'Horário coincide com o intervalo'; end if;
  if exists (select 1 from public.appointments where organization_id = p_organization_id and status = 'scheduled' and starts_at < v_ends_at and ends_at > p_starts_at) then raise exception 'Já existe um compromisso nesse horário'; end if;
  insert into public.appointments (organization_id, customer_id, service_id, starts_at, ends_at, notes, created_by, idempotency_key) values (p_organization_id, p_customer_id, p_service_id, p_starts_at, v_ends_at, nullif(trim(p_notes), ''), v_user_id, p_idempotency_key) returning id into v_existing;
  return v_existing;
end;
$$;

create or replace function public.cancel_appointment(p_appointment_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_organization_id uuid;
begin
  select organization_id into v_organization_id from public.appointments where id = p_appointment_id for update;
  if v_organization_id is null or not public.has_organization_role(v_organization_id, 'admin') then raise exception 'Usuário sem permissão administrativa'; end if;
  update public.appointments set status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), updated_at = now() where id = p_appointment_id and status = 'scheduled';
end;
$$;

revoke all on function public.create_appointment(uuid, uuid, uuid, timestamptz, text, text) from public;
grant execute on function public.create_appointment(uuid, uuid, uuid, timestamptz, text, text) to authenticated;
revoke all on function public.cancel_appointment(uuid) from public;
grant execute on function public.cancel_appointment(uuid) to authenticated;

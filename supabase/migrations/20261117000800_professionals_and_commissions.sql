-- Profissionais e comissão por atendimento.
-- A taxa é copiada para o atendimento no momento do registro para preservar o histórico.

create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  phone_normalized text,
  default_commission_rate numeric(5,2) not null default 0 check (default_commission_rate >= 0 and default_commission_rate <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index if not exists professionals_organization_active_idx on public.professionals(organization_id, active, name);

alter table public.professionals enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'professionals' and policyname = 'members can read professionals') then
    create policy "members can read professionals" on public.professionals for select using (public.is_active_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'professionals' and policyname = 'admins can create professionals') then
    create policy "admins can create professionals" on public.professionals for insert with check (public.has_organization_role(organization_id, 'admin'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'professionals' and policyname = 'admins can update professionals') then
    create policy "admins can update professionals" on public.professionals for update using (public.has_organization_role(organization_id, 'admin')) with check (public.has_organization_role(organization_id, 'admin'));
  end if;
end;
$$;

alter table public.attendances add column if not exists professional_id uuid references public.professionals(id);
alter table public.attendances add column if not exists professional_name_snapshot text;
alter table public.attendances add column if not exists commission_rate_snapshot numeric(5,2) check (commission_rate_snapshot is null or (commission_rate_snapshot >= 0 and commission_rate_snapshot <= 100));

create index if not exists attendances_professional_date_idx on public.attendances(organization_id, professional_id, performed_at desc);

create or replace function public.register_attendance(
  p_organization_id uuid,
  p_customer_id uuid,
  p_service_id uuid,
  p_performed_at timestamptz,
  p_professional_id uuid,
  p_price_cents integer,
  p_notes text,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_attendance_id uuid;
  v_latest_attendance_id uuid;
  v_service_name text;
  v_service_duration integer;
  v_return_period integer;
  v_timezone text;
  v_professional_name text;
  v_commission_rate numeric(5,2);
begin
  if v_user_id is null or not public.is_active_member(p_organization_id) then
    raise exception 'Usuário sem acesso à organização';
  end if;
  if p_price_cents is not null and p_price_cents < 0 then raise exception 'Valor inválido'; end if;

  select id into v_attendance_id from public.attendances where organization_id = p_organization_id and idempotency_key = p_idempotency_key;
  if v_attendance_id is not null then return v_attendance_id; end if;

  select name, duration_minutes, return_period_days into v_service_name, v_service_duration, v_return_period
  from public.services where id = p_service_id and organization_id = p_organization_id and active = true;
  if not found then raise exception 'Serviço inválido ou inativo'; end if;

  if p_professional_id is not null then
    select name, default_commission_rate into v_professional_name, v_commission_rate
    from public.professionals where id = p_professional_id and organization_id = p_organization_id and active = true;
    if not found then raise exception 'Profissional inválido ou inativo'; end if;
  end if;

  if not exists (select 1 from public.customers where id = p_customer_id and organization_id = p_organization_id and status = 'active') then
    raise exception 'Contato inválido ou arquivado';
  end if;

  insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key, professional_id, professional_name_snapshot, commission_rate_snapshot)
  values (p_organization_id, p_customer_id, p_service_id, p_performed_at, v_service_name, v_service_duration, v_return_period, p_price_cents, nullif(trim(p_notes), ''), v_user_id, p_idempotency_key, p_professional_id, v_professional_name, v_commission_rate)
  returning id into v_attendance_id;

  select id into v_latest_attendance_id from public.attendances where organization_id = p_organization_id and customer_id = p_customer_id and service_id = p_service_id and status = 'completed' order by performed_at desc, created_at desc limit 1;
  if v_latest_attendance_id = v_attendance_id then
    update public.follow_ups set status = 'substituted', updated_at = now() where organization_id = p_organization_id and customer_id = p_customer_id and service_id = p_service_id and status <> 'substituted';
    if v_return_period is not null then
      select timezone into v_timezone from public.organizations where id = p_organization_id;
      insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date)
      values (p_organization_id, p_customer_id, p_service_id, v_attendance_id, ((p_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period), ((p_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period));
    end if;
  end if;
  return v_attendance_id;
end;
$$;

revoke all on function public.register_attendance(uuid, uuid, uuid, timestamptz, uuid, integer, text, text) from public;
grant execute on function public.register_attendance(uuid, uuid, uuid, timestamptz, uuid, integer, text, text) to authenticated;

create or replace function public.update_attendance(
  p_attendance_id uuid,
  p_customer_id uuid,
  p_service_id uuid,
  p_performed_at timestamptz,
  p_professional_id uuid,
  p_price_cents integer,
  p_notes text
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_service_name text;
  v_service_duration integer;
  v_return_period integer;
  v_timezone text;
  v_latest_id uuid;
  v_professional_name text;
  v_commission_rate numeric(5,2);
begin
  select organization_id into v_organization_id from public.attendances where id = p_attendance_id and status = 'completed' for update;
  if v_organization_id is null or v_user_id is null or not public.has_organization_role(v_organization_id, 'admin') then raise exception 'Usuário sem permissão administrativa'; end if;
  if p_price_cents is not null and p_price_cents < 0 then raise exception 'Valor inválido'; end if;
  select name, duration_minutes, return_period_days into v_service_name, v_service_duration, v_return_period from public.services where id = p_service_id and organization_id = v_organization_id and active = true;
  if not found then raise exception 'Serviço inválido ou inativo'; end if;
  if p_professional_id is not null then
    select name, default_commission_rate into v_professional_name, v_commission_rate from public.professionals where id = p_professional_id and organization_id = v_organization_id and active = true;
    if not found then raise exception 'Profissional inválido ou inativo'; end if;
  end if;
  if not exists (select 1 from public.customers where id = p_customer_id and organization_id = v_organization_id and status = 'active') then raise exception 'Contato inválido ou arquivado'; end if;
  update public.follow_ups set status = 'substituted', updated_at = now() where organization_id = v_organization_id and (attendance_id = p_attendance_id or (customer_id = p_customer_id and service_id = p_service_id)) and status in ('pending', 'postponed', 'contacted');
  update public.attendances set customer_id = p_customer_id, service_id = p_service_id, performed_at = p_performed_at, service_name_snapshot = v_service_name, service_duration_snapshot = v_service_duration, return_period_days_snapshot = v_return_period, price_cents = p_price_cents, notes = nullif(trim(p_notes), ''), professional_id = p_professional_id, professional_name_snapshot = v_professional_name, commission_rate_snapshot = v_commission_rate, updated_at = now() where id = p_attendance_id;
  select id into v_latest_id from public.attendances where organization_id = v_organization_id and customer_id = p_customer_id and service_id = p_service_id and status = 'completed' order by performed_at desc, created_at desc limit 1;
  if v_latest_id = p_attendance_id and v_return_period is not null then
    select timezone into v_timezone from public.organizations where id = v_organization_id;
    insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date) values (v_organization_id, p_customer_id, p_service_id, p_attendance_id, ((p_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period), ((p_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period));
  end if;
end;
$$;

revoke all on function public.update_attendance(uuid, uuid, uuid, timestamptz, uuid, integer, text) from public;
grant execute on function public.update_attendance(uuid, uuid, uuid, timestamptz, uuid, integer, text) to authenticated;

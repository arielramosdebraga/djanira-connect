create table public.attendances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  service_id uuid not null references public.services(id),
  performed_at timestamptz not null,
  service_name_snapshot text not null,
  service_duration_snapshot integer not null check (service_duration_snapshot > 0),
  return_period_days_snapshot integer check (return_period_days_snapshot is null or return_period_days_snapshot > 0),
  price_cents integer check (price_cents is null or price_cents >= 0),
  notes text,
  created_by uuid not null references auth.users(id),
  idempotency_key text not null,
  status text not null default 'completed' check (status in ('completed', 'cancelled')),
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  service_id uuid not null references public.services(id),
  attendance_id uuid not null references public.attendances(id),
  original_due_date date not null,
  next_follow_up_date date not null,
  status text not null default 'pending' check (status in ('pending', 'contacted', 'postponed', 'dismissed', 'substituted')),
  contacted_at timestamptz,
  contacted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index follow_ups_one_active_per_customer_service_idx
  on public.follow_ups(organization_id, customer_id, service_id)
  where status in ('pending', 'contacted', 'postponed');

create index attendances_customer_date_idx on public.attendances(organization_id, customer_id, performed_at desc);
create index follow_ups_queue_idx on public.follow_ups(organization_id, next_follow_up_date, status);

alter table public.attendances enable row level security;
alter table public.follow_ups enable row level security;

create policy "members can read attendances" on public.attendances for select using (public.is_active_member(organization_id));
create policy "members can read follow ups" on public.follow_ups for select using (public.is_active_member(organization_id));

create or replace function public.register_attendance(
  p_organization_id uuid,
  p_customer_id uuid,
  p_service_id uuid,
  p_performed_at timestamptz,
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
begin
  if v_user_id is null or not public.is_active_member(p_organization_id) then
    raise exception 'Usuário sem acesso à organização';
  end if;

  if p_price_cents is not null and p_price_cents < 0 then
    raise exception 'Valor inválido';
  end if;

  select id into v_attendance_id
  from public.attendances
  where organization_id = p_organization_id and idempotency_key = p_idempotency_key;
  if v_attendance_id is not null then return v_attendance_id; end if;

  select name, duration_minutes, return_period_days
  into v_service_name, v_service_duration, v_return_period
  from public.services
  where id = p_service_id and organization_id = p_organization_id and active = true;
  if not found then raise exception 'Serviço inválido ou inativo'; end if;

  if not exists (select 1 from public.customers where id = p_customer_id and organization_id = p_organization_id and status = 'active') then
    raise exception 'Contato inválido ou arquivado';
  end if;

  insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key)
  values (p_organization_id, p_customer_id, p_service_id, p_performed_at, v_service_name, v_service_duration, v_return_period, p_price_cents, nullif(trim(p_notes), ''), v_user_id, p_idempotency_key)
  returning id into v_attendance_id;

  select id into v_latest_attendance_id
  from public.attendances
  where organization_id = p_organization_id and customer_id = p_customer_id and service_id = p_service_id and status = 'completed'
  order by performed_at desc, created_at desc
  limit 1;

  if v_latest_attendance_id = v_attendance_id then
    update public.follow_ups
    set status = 'substituted', updated_at = now()
    where organization_id = p_organization_id and customer_id = p_customer_id and service_id = p_service_id and status <> 'substituted';

    if v_return_period is not null then
      select timezone into v_timezone from public.organizations where id = p_organization_id;
      insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date)
      values (p_organization_id, p_customer_id, p_service_id, v_attendance_id, ((p_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period), ((p_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period));
    end if;
  end if;

  return v_attendance_id;
end;
$$;

revoke all on function public.register_attendance(uuid, uuid, uuid, timestamptz, integer, text, text) from public;
grant execute on function public.register_attendance(uuid, uuid, uuid, timestamptz, integer, text, text) to authenticated;

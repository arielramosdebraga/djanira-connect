alter table public.appointments alter column created_by drop not null;
alter table public.appointments add column if not exists source text not null default 'internal' check (source in ('internal', 'public'));

create or replace function public.get_public_reservation_catalog()
returns table (service_id uuid, service_name text, duration_minutes integer)
language sql stable security definer set search_path = public as $$
  select s.id, s.name, s.duration_minutes
  from public.services s
  where s.organization_id = (select id from public.organizations order by created_at limit 1)
    and s.active = true
  order by s.name;
$$;

create or replace function public.create_public_reservation(
  p_service_id uuid,
  p_customer_name text,
  p_phone_normalized text,
  p_starts_at timestamptz,
  p_idempotency_key text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_organization_id uuid;
  v_service_id uuid;
  v_customer_id uuid;
  v_duration integer;
  v_ends_at timestamptz;
  v_timezone text;
  v_weekday integer;
  v_start_time time;
  v_end_time time;
  v_break_start time;
  v_break_end time;
  v_existing uuid;
begin
  select id, organization_id, duration_minutes into v_service_id, v_organization_id, v_duration from public.services where id = p_service_id and active = true;
  if v_organization_id is null then raise exception 'Serviço indisponível'; end if;
  select id into v_existing from public.appointments where organization_id = v_organization_id and idempotency_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;
  select timezone into v_timezone from public.organizations where id = v_organization_id;
  v_ends_at := p_starts_at + make_interval(mins => v_duration);
  v_weekday := extract(dow from (p_starts_at at time zone coalesce(v_timezone, 'America/Sao_Paulo')));
  select start_time, end_time, break_start, break_end into v_start_time, v_end_time, v_break_start, v_break_end from public.availability_rules where organization_id = v_organization_id and weekday = v_weekday and active = true;
  if not found then raise exception 'Não há horários disponíveis para esse dia'; end if;
  if (p_starts_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time < v_start_time or (v_ends_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time > v_end_time then raise exception 'Horário fora do período disponível'; end if;
  if v_break_start is not null and (p_starts_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time < v_break_end and (v_ends_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time > v_break_start then raise exception 'Horário coincide com o intervalo'; end if;
  if exists (select 1 from public.appointments where organization_id = v_organization_id and status = 'scheduled' and starts_at < v_ends_at and ends_at > p_starts_at) then raise exception 'Horário já reservado'; end if;
  select id into v_customer_id from public.customers where organization_id = v_organization_id and phone_normalized = p_phone_normalized limit 1;
  if v_customer_id is null then
    insert into public.customers (organization_id, name, phone_normalized) values (v_organization_id, trim(p_customer_name), p_phone_normalized) returning id into v_customer_id;
  else
    update public.customers set name = trim(p_customer_name), status = 'active', updated_at = now() where id = v_customer_id;
  end if;
  insert into public.appointments (organization_id, customer_id, service_id, starts_at, ends_at, created_by, idempotency_key, source) values (v_organization_id, v_customer_id, p_service_id, p_starts_at, v_ends_at, null, p_idempotency_key, 'public') returning id into v_existing;
  return v_existing;
end;
$$;

revoke all on function public.get_public_reservation_catalog() from public;
grant execute on function public.get_public_reservation_catalog() to anon, authenticated;
revoke all on function public.create_public_reservation(uuid, text, text, timestamptz, text) from public;
grant execute on function public.create_public_reservation(uuid, text, text, timestamptz, text) to anon, authenticated;

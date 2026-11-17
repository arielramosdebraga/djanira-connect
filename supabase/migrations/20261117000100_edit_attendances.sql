create or replace function public.update_attendance(
  p_attendance_id uuid,
  p_customer_id uuid,
  p_service_id uuid,
  p_performed_at timestamptz,
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
begin
  select organization_id into v_organization_id from public.attendances where id = p_attendance_id and status = 'completed' for update;
  if v_organization_id is null or v_user_id is null or not public.has_organization_role(v_organization_id, 'admin') then raise exception 'Usuário sem permissão administrativa'; end if;
  if p_price_cents is not null and p_price_cents < 0 then raise exception 'Valor inválido'; end if;
  select name, duration_minutes, return_period_days into v_service_name, v_service_duration, v_return_period from public.services where id = p_service_id and organization_id = v_organization_id and active = true;
  if not found then raise exception 'Serviço inválido ou inativo'; end if;
  if not exists (select 1 from public.customers where id = p_customer_id and organization_id = v_organization_id and status = 'active') then raise exception 'Contato inválido ou arquivado'; end if;
  update public.follow_ups set status = 'substituted', updated_at = now() where organization_id = v_organization_id and (attendance_id = p_attendance_id or (customer_id = p_customer_id and service_id = p_service_id)) and status in ('pending', 'postponed', 'contacted');
  update public.attendances set customer_id = p_customer_id, service_id = p_service_id, performed_at = p_performed_at, service_name_snapshot = v_service_name, service_duration_snapshot = v_service_duration, return_period_days_snapshot = v_return_period, price_cents = p_price_cents, notes = nullif(trim(p_notes), ''), updated_at = now() where id = p_attendance_id;
  select id into v_latest_id from public.attendances where organization_id = v_organization_id and customer_id = p_customer_id and service_id = p_service_id and status = 'completed' order by performed_at desc, created_at desc limit 1;
  if v_latest_id = p_attendance_id and v_return_period is not null then
    select timezone into v_timezone from public.organizations where id = v_organization_id;
    insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date) values (v_organization_id, p_customer_id, p_service_id, p_attendance_id, ((p_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period), ((p_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period));
  end if;
end;
$$;

revoke all on function public.update_attendance(uuid, uuid, uuid, timestamptz, integer, text) from public;
grant execute on function public.update_attendance(uuid, uuid, uuid, timestamptz, integer, text) to authenticated;

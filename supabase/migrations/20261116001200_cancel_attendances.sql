create or replace function public.cancel_attendance(p_attendance_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_customer_id uuid;
  v_service_id uuid;
  v_attendance_id uuid;
  v_timezone text;
  v_return_period integer;
  v_performed_at timestamptz;
  v_previous_id uuid;
begin
  select organization_id, customer_id, service_id, id into v_organization_id, v_customer_id, v_service_id, v_attendance_id from public.attendances where id = p_attendance_id for update;
  if v_attendance_id is null or v_user_id is null or not public.has_organization_role(v_organization_id, 'admin') then raise exception 'Usuário sem permissão administrativa'; end if;
  update public.attendances set status = 'cancelled', cancelled_at = now(), cancelled_by = v_user_id, updated_at = now() where id = v_attendance_id and status = 'completed';
  update public.follow_ups set status = 'substituted', updated_at = now() where attendance_id = v_attendance_id and status in ('pending', 'postponed', 'contacted');
  select a.id, a.performed_at, a.return_period_days_snapshot into v_previous_id, v_performed_at, v_return_period from public.attendances a where a.organization_id = v_organization_id and a.customer_id = v_customer_id and a.service_id = v_service_id and a.status = 'completed' order by a.performed_at desc, a.created_at desc limit 1;
  if v_previous_id is not null and v_return_period is not null then
    select timezone into v_timezone from public.organizations where id = v_organization_id;
    insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date) values (v_organization_id, v_customer_id, v_service_id, v_previous_id, ((v_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period), ((v_performed_at at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date + v_return_period));
  end if;
end;
$$;

revoke all on function public.cancel_attendance(uuid) from public;
grant execute on function public.cancel_attendance(uuid) to authenticated;

-- Adiciona mais dois retornos fictícios para hoje.
-- Idempotente: pode ser executada novamente sem criar duplicidades.
do $$
declare
  v_organization_id uuid;
  v_user_id uuid;
  v_customer_marina uuid;
  v_customer_beatriz uuid;
  v_service_hydration uuid;
  v_service_cut uuid;
  v_attendance_marina uuid;
  v_attendance_beatriz uuid;
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select id into v_organization_id from public.organizations order by created_at limit 1;
  if v_organization_id is null then
    raise exception 'Crie uma organização antes de executar os dados de demonstração.';
  end if;

  select user_id into v_user_id
  from public.organization_members
  where organization_id = v_organization_id and active = true
  order by created_at
  limit 1;

  select id into v_customer_marina from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990001' limit 1;
  select id into v_customer_beatriz from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990003' limit 1;
  select id into v_service_hydration from public.services where organization_id = v_organization_id and name = 'Hidratação capilar' order by created_at limit 1;
  select id into v_service_cut from public.services where organization_id = v_organization_id and name = 'Corte feminino' order by created_at limit 1;

  if v_user_id is not null and v_customer_marina is not null and v_service_hydration is not null then
    insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key)
    select v_organization_id, v_customer_marina, v_service_hydration, (v_today - 30)::timestamp at time zone 'America/Sao_Paulo', 'Hidratação capilar', 60, 30, 8500, 'Atendimento fictício para testar retorno de hoje.', v_user_id, 'demo-attendance-marina-hydration-today'
    where not exists (select 1 from public.attendances where organization_id = v_organization_id and idempotency_key = 'demo-attendance-marina-hydration-today');

    select id into v_attendance_marina from public.attendances where organization_id = v_organization_id and idempotency_key = 'demo-attendance-marina-hydration-today';

    insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date, status)
    select v_organization_id, v_customer_marina, v_service_hydration, v_attendance_marina, v_today, v_today, 'pending'
    where v_attendance_marina is not null and not exists (
      select 1 from public.follow_ups where organization_id = v_organization_id and customer_id = v_customer_marina and service_id = v_service_hydration and status in ('pending', 'contacted', 'postponed')
    );
  end if;

  if v_user_id is not null and v_customer_beatriz is not null and v_service_cut is not null then
    insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key)
    select v_organization_id, v_customer_beatriz, v_service_cut, (v_today - 45)::timestamp at time zone 'America/Sao_Paulo', 'Corte feminino', 45, 45, 7000, 'Atendimento fictício para testar retorno de hoje.', v_user_id, 'demo-attendance-beatriz-cut-today'
    where not exists (select 1 from public.attendances where organization_id = v_organization_id and idempotency_key = 'demo-attendance-beatriz-cut-today');

    select id into v_attendance_beatriz from public.attendances where organization_id = v_organization_id and idempotency_key = 'demo-attendance-beatriz-cut-today';

    insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date, status)
    select v_organization_id, v_customer_beatriz, v_service_cut, v_attendance_beatriz, v_today, v_today, 'pending'
    where v_attendance_beatriz is not null and not exists (
      select 1 from public.follow_ups where organization_id = v_organization_id and customer_id = v_customer_beatriz and service_id = v_service_cut and status in ('pending', 'contacted', 'postponed')
    );
  end if;
end;
$$;

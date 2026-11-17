-- Dados fictícios para facilitar a validação manual da aplicação.
-- Esta migration é idempotente e usa apenas a primeira organização cadastrada.
do $$
declare
  v_organization_id uuid;
  v_user_id uuid;
  v_service_hydration uuid;
  v_service_cut uuid;
  v_service_brows uuid;
  v_customer_marina uuid;
  v_customer_lucas uuid;
  v_customer_beatriz uuid;
  v_attendance_id uuid;
begin
  select id into v_organization_id
  from public.organizations
  order by created_at
  limit 1;

  if v_organization_id is null then
    raise exception 'Crie uma organização antes de executar os dados de demonstração.';
  end if;

  select user_id into v_user_id
  from public.organization_members
  where organization_id = v_organization_id and active = true
  order by created_at
  limit 1;

  insert into public.services (organization_id, name, average_price_cents, duration_minutes, return_period_days, active)
  select v_organization_id, 'Hidratação capilar', 8500, 60, 30, true
  where not exists (select 1 from public.services where organization_id = v_organization_id and name = 'Hidratação capilar');
  select id into v_service_hydration from public.services where organization_id = v_organization_id and name = 'Hidratação capilar' order by created_at limit 1;

  insert into public.services (organization_id, name, average_price_cents, duration_minutes, return_period_days, active)
  select v_organization_id, 'Corte feminino', 7000, 45, 45, true
  where not exists (select 1 from public.services where organization_id = v_organization_id and name = 'Corte feminino');
  select id into v_service_cut from public.services where organization_id = v_organization_id and name = 'Corte feminino' order by created_at limit 1;

  insert into public.services (organization_id, name, average_price_cents, duration_minutes, return_period_days, active)
  select v_organization_id, 'Design de sobrancelhas', 3500, 30, 20, true
  where not exists (select 1 from public.services where organization_id = v_organization_id and name = 'Design de sobrancelhas');
  select id into v_service_brows from public.services where organization_id = v_organization_id and name = 'Design de sobrancelhas' order by created_at limit 1;

  insert into public.availability_rules (organization_id, weekday, start_time, end_time, break_start, break_end, active)
  values
    (v_organization_id, 1, '09:00', '18:00', '12:00', '13:00', true),
    (v_organization_id, 2, '09:00', '18:00', '12:00', '13:00', true),
    (v_organization_id, 3, '09:00', '18:00', '12:00', '13:00', true),
    (v_organization_id, 4, '09:00', '18:00', '12:00', '13:00', true),
    (v_organization_id, 5, '09:00', '18:00', '12:00', '13:00', true),
    (v_organization_id, 6, '09:00', '13:00', null, null, true)
  on conflict (organization_id, weekday) do update set
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    break_start = excluded.break_start,
    break_end = excluded.break_end,
    active = excluded.active,
    updated_at = now();

  insert into public.customers (organization_id, name, phone_normalized, notes, status)
  select v_organization_id, 'Marina Alves', '5511999990001', 'Cliente fictícia para validação do histórico.', 'active'
  where not exists (select 1 from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990001');
  select id into v_customer_marina from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990001' limit 1;

  insert into public.customers (organization_id, name, phone_normalized, notes, status)
  select v_organization_id, 'Lucas Mendes', '5511999990002', 'Cliente fictício com retorno pendente.', 'active'
  where not exists (select 1 from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990002');
  select id into v_customer_lucas from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990002' limit 1;

  insert into public.customers (organization_id, name, phone_normalized, notes, status)
  select v_organization_id, 'Beatriz Costa', '5511999990003', 'Cliente fictícia para testar a agenda.', 'active'
  where not exists (select 1 from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990003');
  select id into v_customer_beatriz from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990003' limit 1;

  if v_user_id is not null then
    insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key)
    values (v_organization_id, v_customer_lucas, v_service_hydration, now() - interval '30 days', 'Hidratação capilar', 60, 30, 8500, 'Atendimento fictício para testar a fila de retornos.', v_user_id, 'demo-attendance-lucas-hydration')
    on conflict (organization_id, idempotency_key) do nothing
    returning id into v_attendance_id;

    if v_attendance_id is null then
      select id into v_attendance_id from public.attendances where organization_id = v_organization_id and idempotency_key = 'demo-attendance-lucas-hydration';
    end if;

    insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date, status)
    select v_organization_id, v_customer_lucas, v_service_hydration, v_attendance_id, current_date, current_date, 'pending'
    where not exists (select 1 from public.follow_ups where organization_id = v_organization_id and attendance_id = v_attendance_id);

    insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key)
    values (v_organization_id, v_customer_marina, v_service_cut, now() - interval '12 days', 'Corte feminino', 45, 45, 7000, 'Atendimento fictício concluído.', v_user_id, 'demo-attendance-marina-cut')
    on conflict (organization_id, idempotency_key) do nothing;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'appointments' and column_name = 'source'
    ) then
      insert into public.appointments (organization_id, customer_id, service_id, starts_at, ends_at, status, notes, created_by, idempotency_key, source)
      select v_organization_id, v_customer_beatriz, v_service_brows,
        (current_date + interval '1 day' + interval '10 hours') at time zone 'America/Sao_Paulo',
        (current_date + interval '1 day' + interval '10 hours 30 minutes') at time zone 'America/Sao_Paulo',
        'scheduled', 'Compromisso fictício para testar a agenda.', v_user_id, 'demo-appointment-beatriz-brows', 'internal'
      where not exists (select 1 from public.appointments where organization_id = v_organization_id and idempotency_key = 'demo-appointment-beatriz-brows');
    else
      insert into public.appointments (organization_id, customer_id, service_id, starts_at, ends_at, status, notes, created_by, idempotency_key)
      select v_organization_id, v_customer_beatriz, v_service_brows,
        (current_date + interval '1 day' + interval '10 hours') at time zone 'America/Sao_Paulo',
        (current_date + interval '1 day' + interval '10 hours 30 minutes') at time zone 'America/Sao_Paulo',
        'scheduled', 'Compromisso fictício para testar a agenda.', v_user_id, 'demo-appointment-beatriz-brows'
      where not exists (select 1 from public.appointments where organization_id = v_organization_id and idempotency_key = 'demo-appointment-beatriz-brows');
    end if;
  end if;
end;
$$;

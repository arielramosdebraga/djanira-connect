-- Complementa os dados fictícios com retornos distribuídos na fila de acompanhamento.
-- Idempotente: pode ser executada novamente sem criar duplicidades.
do $$
declare
  v_organization_id uuid;
  v_user_id uuid;
  v_customer_marina uuid;
  v_customer_beatriz uuid;
  v_service_cut uuid;
  v_service_brows uuid;
  v_attendance_marina uuid;
  v_attendance_beatriz uuid;
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
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

  if v_user_id is null then
    raise exception 'Adicione um membro ativo antes de executar os dados de demonstração.';
  end if;

  select id into v_customer_marina from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990001' limit 1;
  select id into v_customer_beatriz from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990003' limit 1;
  select id into v_service_cut from public.services where organization_id = v_organization_id and name = 'Corte feminino' order by created_at limit 1;
  select id into v_service_brows from public.services where organization_id = v_organization_id and name = 'Design de sobrancelhas' order by created_at limit 1;

  select id into v_attendance_marina
  from public.attendances
  where organization_id = v_organization_id and idempotency_key = 'demo-attendance-marina-cut';

  if v_customer_marina is not null and v_service_cut is not null and v_attendance_marina is not null then
    insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date, status)
    select v_organization_id, v_customer_marina, v_service_cut, v_attendance_marina, v_today + 3, v_today + 3, 'pending'
    where not exists (
      select 1 from public.follow_ups
      where organization_id = v_organization_id and customer_id = v_customer_marina and service_id = v_service_cut and status in ('pending', 'contacted', 'postponed')
    );
  end if;

  if v_customer_beatriz is not null and v_service_brows is not null then
    insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key)
    select v_organization_id, v_customer_beatriz, v_service_brows, (v_today - 15)::timestamp at time zone 'America/Sao_Paulo', 'Design de sobrancelhas', 30, 20, 3500, 'Atendimento fictício para testar retornos futuros.', v_user_id, 'demo-attendance-beatriz-brows'
    where not exists (select 1 from public.attendances where organization_id = v_organization_id and idempotency_key = 'demo-attendance-beatriz-brows');

    select id into v_attendance_beatriz
    from public.attendances
    where organization_id = v_organization_id and idempotency_key = 'demo-attendance-beatriz-brows';

    insert into public.follow_ups (organization_id, customer_id, service_id, attendance_id, original_due_date, next_follow_up_date, status)
    select v_organization_id, v_customer_beatriz, v_service_brows, v_attendance_beatriz, v_today + 5, v_today + 5, 'pending'
    where v_attendance_beatriz is not null
      and not exists (
        select 1 from public.follow_ups
        where organization_id = v_organization_id and customer_id = v_customer_beatriz and service_id = v_service_brows and status in ('pending', 'contacted', 'postponed')
      );
  end if;
end;
$$;

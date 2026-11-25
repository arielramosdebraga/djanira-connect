-- Atendimentos fictícios no período atual para demonstrar os relatórios.
-- Idempotente: pode ser executada novamente sem criar duplicidades.
do $$
declare
  v_organization_id uuid;
  v_user_id uuid;
  v_customer_lucas uuid;
  v_customer_marina uuid;
  v_service_cut uuid;
  v_service_brows uuid;
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select id into v_organization_id from public.organizations order by created_at limit 1;
  if v_organization_id is null then
    return;
  end if;

  select user_id into v_user_id from public.organization_members where organization_id = v_organization_id and active = true order by created_at limit 1;
  select id into v_customer_lucas from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990002' limit 1;
  select id into v_customer_marina from public.customers where organization_id = v_organization_id and phone_normalized = '5511999990001' limit 1;
  select id into v_service_cut from public.services where organization_id = v_organization_id and name = 'Corte feminino' order by created_at limit 1;
  select id into v_service_brows from public.services where organization_id = v_organization_id and name = 'Design de sobrancelhas' order by created_at limit 1;

  if v_user_id is not null and v_customer_lucas is not null and v_service_cut is not null then
    insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key)
    select v_organization_id, v_customer_lucas, v_service_cut, (v_today - 1)::timestamp at time zone 'America/Sao_Paulo', 'Corte feminino', 45, 45, 7000, 'Atendimento fictício para demonstrar a arrecadação da semana.', v_user_id, 'demo-revenue-lucas-cut'
    where not exists (select 1 from public.attendances where organization_id = v_organization_id and idempotency_key = 'demo-revenue-lucas-cut');
  end if;

  if v_user_id is not null and v_customer_marina is not null and v_service_brows is not null then
    insert into public.attendances (organization_id, customer_id, service_id, performed_at, service_name_snapshot, service_duration_snapshot, return_period_days_snapshot, price_cents, notes, created_by, idempotency_key)
    select v_organization_id, v_customer_marina, v_service_brows, (v_today - 2)::timestamp at time zone 'America/Sao_Paulo', 'Design de sobrancelhas', 30, 20, 3500, 'Atendimento fictício para demonstrar a arrecadação do mês.', v_user_id, 'demo-revenue-marina-brows'
    where not exists (select 1 from public.attendances where organization_id = v_organization_id and idempotency_key = 'demo-revenue-marina-brows');
  end if;
end;
$$;

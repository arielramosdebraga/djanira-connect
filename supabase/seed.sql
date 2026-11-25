-- O Supabase CLI executa este arquivo depois das migrations.
-- Cria uma conta e uma organização exclusivas do ambiente local antes de
-- chamar as funções idempotentes de dados fictícios.
do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';
  v_organization_id uuid := '00000000-0000-0000-0000-000000000002';
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  )
  values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'local@djanira.test',
    crypt('DjaniraLocal123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(), now(), '', '', '', ''
  )
  on conflict (id) do nothing;

  insert into public.organizations (id, name, timezone)
  values (v_organization_id, 'Djanira Montclair - Local', 'America/Sao_Paulo')
  on conflict (id) do nothing;

  insert into public.organization_members (organization_id, user_id, role, active)
  values (v_organization_id, v_user_id, 'admin', true)
  on conflict (organization_id, user_id) do update set active = true, role = 'admin';
end;
$$;

select public.seed_demo_data();

-- Catálogo local complementar para facilitar os testes da reserva.
do $$
declare
  v_organization_id uuid;
begin
  select id into v_organization_id from public.organizations order by created_at limit 1;

  insert into public.services (organization_id, name, average_price_cents, duration_minutes, return_period_days, active)
  select v_organization_id, item.name, item.price_cents, item.duration_minutes, item.return_period_days, true
  from (values
    ('Manicure tradicional (mãos)', 4000, 45, 14),
    ('Pedicure tradicional (pés)', 4000, 60, 14),
    ('Pé e mão', 6500, 105, 14),
    ('Esmaltação em gel (mãos)', 7500, 75, 21),
    ('Banho de gel / blindagem', 9000, 90, 21),
    ('Alongamento de unhas em gel', 17000, 180, 21),
    ('Manutenção de alongamento em gel', 12000, 120, 21),
    ('Unhas de fibra de vidro', 18000, 210, 21),
    ('Remoção de alongamento', 5500, 45, null),
    ('Nail art (por unha)', 1000, 15, null),
    ('Spa dos pés', 6000, 45, 21)
  ) as item(name, price_cents, duration_minutes, return_period_days)
  where not exists (
    select 1 from public.services existing
    where existing.organization_id = v_organization_id and existing.name = item.name
  );
end;
$$;

-- Catálogo inicial de serviços de unhas.
-- Valores são sugestões de referência e podem ser ajustados pelo salão.
do $$
declare
  v_organization_id uuid;
begin
  select id into v_organization_id from public.organizations order by created_at limit 1;
  if v_organization_id is null then
    return;
  end if;

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

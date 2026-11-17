create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  average_price_cents integer check (average_price_cents is null or average_price_cents >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  return_period_days integer check (return_period_days is null or return_period_days > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_organization_active_idx on public.services(organization_id, active);
create index services_organization_name_idx on public.services(organization_id, name);

alter table public.services enable row level security;

create policy "members can read services"
  on public.services for select
  using (public.is_active_member(organization_id));

create policy "admins can create services"
  on public.services for insert
  with check (public.has_organization_role(organization_id, 'admin'));

create policy "admins can update services"
  on public.services for update
  using (public.has_organization_role(organization_id, 'admin'))
  with check (public.has_organization_role(organization_id, 'admin'));

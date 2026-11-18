create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  phone_normalized text not null,
  notes text,
  do_not_contact boolean not null default false,
  status text not null default 'active' check (status in ('active', 'archived')),
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_organization_name_idx on public.customers(organization_id, name);
create index if not exists customers_organization_phone_idx on public.customers(organization_id, phone_normalized);
create index if not exists customers_organization_status_idx on public.customers(organization_id, status);

alter table public.customers enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'members can read customers') then
    create policy "members can read customers" on public.customers for select using (public.is_active_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'members can create customers') then
    create policy "members can create customers" on public.customers for insert with check (public.is_active_member(organization_id));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'members can update customers') then
    create policy "members can update customers" on public.customers for update using (public.is_active_member(organization_id)) with check (public.is_active_member(organization_id));
  end if;
end;
$$;

create extension if not exists "pgcrypto";

create type public.organization_member_role as enum ('admin', 'operator');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Sao_Paulo',
  default_message text not null default 'Olá, {{customer_name}}! Aqui é do {{salon_name}}. Podemos combinar um novo atendimento de {{service_name}}?',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_member_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_members_user_id_idx on public.organization_members(user_id);

create or replace function public.is_active_member(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members where organization_id = target_organization_id and user_id = auth.uid() and active = true);
$$;

create or replace function public.has_organization_role(target_organization_id uuid, target_role public.organization_member_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members where organization_id = target_organization_id and user_id = auth.uid() and active = true and role = target_role);
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create policy "members can read their organizations" on public.organizations for select using (public.is_active_member(id));
create policy "members can read active memberships" on public.organization_members for select using (user_id = auth.uid() or public.is_active_member(organization_id));

revoke all on function public.is_active_member(uuid) from public;
grant execute on function public.is_active_member(uuid) to authenticated;
revoke all on function public.has_organization_role(uuid, public.organization_member_role) from public;
grant execute on function public.has_organization_role(uuid, public.organization_member_role) to authenticated;

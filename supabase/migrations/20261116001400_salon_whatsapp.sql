alter table public.organizations add column if not exists whatsapp_phone text;

create or replace function public.update_organization_settings(
  p_organization_id uuid,
  p_name text,
  p_timezone text,
  p_default_message text,
  p_whatsapp_phone text
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_organization_role(p_organization_id, 'admin') then raise exception 'Usuário sem permissão administrativa'; end if;
  if char_length(trim(p_name)) = 0 then raise exception 'Nome do salão é obrigatório'; end if;
  if char_length(trim(p_default_message)) = 0 then raise exception 'Mensagem padrão é obrigatória'; end if;
  update public.organizations set name = trim(p_name), timezone = trim(p_timezone), default_message = trim(p_default_message), whatsapp_phone = nullif(trim(p_whatsapp_phone), ''), updated_at = now() where id = p_organization_id;
end;
$$;

revoke all on function public.update_organization_settings(uuid, text, text, text, text) from public;
grant execute on function public.update_organization_settings(uuid, text, text, text, text) to authenticated;

create or replace function public.get_public_reservation_contact()
returns table (salon_name text, whatsapp_phone text)
language sql stable security definer set search_path = public as $$
  select name, whatsapp_phone from public.organizations order by created_at limit 1;
$$;

revoke all on function public.get_public_reservation_contact() from public;
grant execute on function public.get_public_reservation_contact() to anon, authenticated;

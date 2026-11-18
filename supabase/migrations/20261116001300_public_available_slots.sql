create or replace function public.get_public_reservation_slots(p_service_id uuid, p_date date)
returns table (slot_time time)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_organization_id uuid;
  v_duration integer;
  v_timezone text;
  v_weekday integer;
  v_start_time time;
  v_end_time time;
  v_break_start time;
  v_break_end time;
  v_slot timestamptz;
  v_last_slot timestamptz;
begin
  select s.organization_id, s.duration_minutes, o.timezone
  into v_organization_id, v_duration, v_timezone
  from public.services s
  join public.organizations o on o.id = s.organization_id
  where s.id = p_service_id and s.active = true;
  if v_organization_id is null then return; end if;

  v_weekday := extract(dow from p_date);
  select start_time, end_time, break_start, break_end
  into v_start_time, v_end_time, v_break_start, v_break_end
  from public.availability_rules
  where organization_id = v_organization_id and weekday = v_weekday and active = true;
  if not found then return; end if;

  v_slot := (p_date + v_start_time) at time zone coalesce(v_timezone, 'America/Sao_Paulo');
  v_last_slot := (p_date + v_end_time - make_interval(mins => v_duration)) at time zone coalesce(v_timezone, 'America/Sao_Paulo');
  while v_slot <= v_last_slot loop
    if (v_break_start is null or (v_slot at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time >= v_break_end or ((v_slot + make_interval(mins => v_duration)) at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time <= v_break_start)
      and not exists (select 1 from public.appointments a where a.organization_id = v_organization_id and a.status = 'scheduled' and a.starts_at < v_slot + make_interval(mins => v_duration) and a.ends_at > v_slot)
      and (p_date > (now() at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date or v_slot > now()) then
      slot_time := (v_slot at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::time;
      return next;
    end if;
    v_slot := v_slot + interval '15 minutes';
  end loop;
end;
$$;

revoke all on function public.get_public_reservation_slots(uuid, date) from public;
grant execute on function public.get_public_reservation_slots(uuid, date) to anon, authenticated;

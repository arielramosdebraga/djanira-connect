-- Execute no SQL Editor do Supabase após aplicar todas as migrations.
select expected.table_name, (actual.table_name is not null) as exists
from (values
  ('organizations'), ('organization_members'), ('services'), ('customers'),
  ('attendances'), ('follow_ups'), ('contact_logs'), ('availability_rules'),
  ('appointments')
) as expected(table_name)
left join information_schema.tables actual
  on actual.table_schema = 'public'
 and actual.table_name = expected.table_name
order by expected.table_name;

select routine_name, routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'register_attendance', 'update_attendance', 'cancel_attendance',
    'get_public_reservation_catalog', 'get_public_reservation_slots',
    'create_public_reservation', 'get_public_reservation_contact'
  )
order by routine_name;

select source, status, count(*) as total
from public.appointments
group by source, status
order by source, status;

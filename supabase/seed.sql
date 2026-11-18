-- O Supabase CLI executa este arquivo depois das migrations.
-- A migration 20261116001000_demo_data.sql cria a função idempotente abaixo.
select public.seed_demo_data();

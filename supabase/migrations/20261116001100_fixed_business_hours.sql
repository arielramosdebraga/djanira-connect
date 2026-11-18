-- Padroniza o expediente para 09:00–18:00 e remove intervalos existentes.
update public.availability_rules
set start_time = '09:00',
    end_time = '18:00',
    break_start = null,
    break_end = null,
    updated_at = now();

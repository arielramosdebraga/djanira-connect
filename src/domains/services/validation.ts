import { z } from "zod";

export const serviceInputSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do serviço."),
  averagePrice: z.string().trim().optional().transform((value) => {
    if (!value) return null;
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : NaN;
  }).refine((value) => value === null || value >= 0, "Informe um valor válido."),
  durationMinutes: z.coerce.number().int().positive("A duração deve ser maior que zero."),
  returnPeriodDays: z.string().trim().optional().transform((value) => value ? Number(value) : null).refine((value) => value === null || Number.isInteger(value) && value > 0, "Informe um prazo válido."),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;

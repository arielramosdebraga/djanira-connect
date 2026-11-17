import { z } from "zod";

export const attendanceInputSchema = z.object({
  customerId: z.string().uuid("Selecione um contato."),
  serviceId: z.string().uuid("Selecione um serviço."),
  performedAt: z.string().min(1, "Informe a data e o horário."),
  price: z.string().trim().optional().transform((value) => {
    if (!value) return null;
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : NaN;
  }).refine((value) => value === null || value >= 0, "Informe um valor válido."),
  notes: z.string().trim().max(500, "Use no máximo 500 caracteres.").optional(),
  idempotencyKey: z.string().uuid("Envio inválido."),
});

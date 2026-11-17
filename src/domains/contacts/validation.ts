import { z } from "zod";

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do contato."),
  phone: z.string().trim().min(1, "Informe o telefone ou WhatsApp."),
  notes: z.string().trim().max(500, "Use no máximo 500 caracteres.").optional(),
  doNotContact: z.boolean().default(false),
});

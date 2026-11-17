"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/session";
import { serviceInputSchema } from "@/domains/services/validation";

function redirectWithError(message: string): never {
  redirect(`/servicos?erro=${encodeURIComponent(message)}`);
}

async function requireAdmin() {
  const context = await requireActiveMember();
  if (context.membership.role !== "admin") redirect("/servicos?erro=sem-permissao");
  return context;
}

export async function createServiceAction(formData: FormData) {
  const { membership, supabase } = await requireAdmin();
  const parsed = serviceInputSchema.safeParse({
    name: formData.get("name"),
    averagePrice: formData.get("averagePrice"),
    durationMinutes: formData.get("durationMinutes"),
    returnPeriodDays: formData.get("returnPeriodDays"),
  });

  if (!parsed.success) redirectWithError(parsed.error.issues[0]?.message ?? "Confira os dados informados.");

  const { error } = await supabase.from("services").insert({
    organization_id: membership.organization_id,
    name: parsed.data.name,
    average_price_cents: parsed.data.averagePrice,
    duration_minutes: parsed.data.durationMinutes,
    return_period_days: parsed.data.returnPeriodDays,
  });

  if (error) redirectWithError("Não foi possível cadastrar o serviço.");
  revalidatePath("/servicos");
  redirect("/servicos?resultado=criado");
}

export async function toggleServiceAction(formData: FormData) {
  const { membership, supabase } = await requireAdmin();
  const serviceId = String(formData.get("serviceId") ?? "");
  const active = formData.get("active") === "true";

  if (!serviceId) redirectWithError("Serviço inválido.");

  const { error } = await supabase
    .from("services")
    .update({ active: !active, updated_at: new Date().toISOString() })
    .eq("id", serviceId)
    .eq("organization_id", membership.organization_id);

  if (error) redirectWithError("Não foi possível atualizar o serviço.");
  revalidatePath("/servicos");
  redirect("/servicos?resultado=atualizado");
}

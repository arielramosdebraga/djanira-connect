"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveMember } from "@/lib/auth/session";
import { normalizePhone } from "@/domains/contacts/phone";

export async function updateSettingsAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/configuracoes?erro=sem-permissao");
  const name = String(formData.get("name") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "America/Sao_Paulo").trim();
  const defaultMessage = String(formData.get("defaultMessage") ?? "").trim();
  const phoneInput = String(formData.get("whatsappPhone") ?? "").trim();
  if (!name || !defaultMessage) redirect("/configuracoes?erro=preencha-os-dados");
  let whatsappPhone = "";
  if (phoneInput) {
    try { whatsappPhone = normalizePhone(phoneInput); } catch (error) { redirect(`/configuracoes?erro=${encodeURIComponent(error instanceof Error ? error.message : "Informe um WhatsApp válido.")}`); }
  }
  const { error } = await supabase.rpc("update_organization_settings", { p_organization_id: membership.organization_id, p_name: name, p_timezone: timezone, p_default_message: defaultMessage, p_whatsapp_phone: whatsappPhone });
  if (error) redirect("/configuracoes?erro=nao-foi-possivel-salvar");
  revalidatePath("/configuracoes"); revalidatePath("/retornos");
  redirect("/configuracoes?resultado=salvo");
}

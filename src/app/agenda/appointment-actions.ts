"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/session";
import { parseSalonDateTime } from "@/lib/dates/salon";

export async function createAppointmentAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
  const customerId = String(formData.get("customerId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const startsAtInput = String(formData.get("startsAt") ?? "");
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  const notes = String(formData.get("notes") ?? "");
  if (!customerId || !serviceId || !idempotencyKey) redirect("/agenda?erro=preencha-os-dados");
  let startsAt: string;
  try { startsAt = parseSalonDateTime(startsAtInput); } catch { redirect("/agenda?erro=data-invalida"); }
  const { error } = await supabase.rpc("create_appointment", { p_organization_id: membership.organization_id, p_customer_id: customerId, p_service_id: serviceId, p_starts_at: startsAt, p_notes: notes || null, p_idempotency_key: idempotencyKey });
  if (error) redirect(`/agenda?erro=${encodeURIComponent(error.message.includes("horário") || error.message.includes("atendimento") ? error.message : "Não foi possível criar o compromisso.")}`);
  revalidatePath("/agenda");
  redirect("/agenda?resultado=compromisso-criado");
}

export async function cancelAppointmentAction(formData: FormData) {
  const { supabase } = await requireActiveMember();
  const appointmentId = String(formData.get("appointmentId") ?? "");
  if (!appointmentId) redirect("/agenda?erro=compromisso-invalido");
  const { error } = await supabase.rpc("cancel_appointment", { p_appointment_id: appointmentId });
  if (error) redirect("/agenda?erro=nao-foi-possivel-cancelar");
  revalidatePath("/agenda");
  redirect("/agenda?resultado=compromisso-cancelado");
}

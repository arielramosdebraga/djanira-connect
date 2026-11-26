"use server";

import { requireActiveMember } from "@lib/auth/session";
import { parseSalonDateTime } from "@lib/dates/salon";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAppointmentAction(formData: FormData) {
  const { membership, firebase } = await requireActiveMember();
  const customerId = String(formData.get("customerId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const startsAtInput = String(formData.get("startsAt") ?? "");
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const returnTo = formData.get("returnTo") === "/inicio" ? "/inicio" : "/agenda";
  if (!customerId || !serviceId || !idempotencyKey) redirect(`${returnTo}?erro=Preencha cliente, serviço, data e horário.`);
  let startsAt: string;
  try { startsAt = parseSalonDateTime(startsAtInput); } catch { redirect(`${returnTo}?erro=Informe uma data e horário válidos.`); }
  const { error } = await firebase.action("createAppointment", { salonId: membership.organization_id, clientId: customerId, serviceId: serviceId, startsAt: startsAt, notes: notes || null, idempotencyKey: idempotencyKey });
  if (error) {
    console.error("Falha ao criar compromisso", { code: error.code, message: error.message, details: error.details, hint: error.hint });
    const knownError = /acesso|organização|serviço|contato|atendimento|horário|compromisso|permissão|período|reservado|inválido|duplic/i.test(error.message);
    redirect(`${returnTo}?erro=${encodeURIComponent(knownError ? error.message : "Não foi possível criar o compromisso. Consulte o log do servidor para mais detalhes.")}`);
  }
  revalidatePath("/agenda");
  redirect(`${returnTo}?resultado=compromisso-criado`);
}

export async function cancelAppointmentAction(formData: FormData) {
  const { firebase } = await requireActiveMember();
  const appointmentId = String(formData.get("appointmentId") ?? "");
  if (!appointmentId) redirect("/agenda?erro=compromisso-invalido");
  const { error } = await firebase.action("cancelAppointment", { appointmentId: appointmentId });
  if (error) redirect("/agenda?erro=nao-foi-possivel-cancelar");
  revalidatePath("/agenda");
  redirect("/agenda?resultado=compromisso-cancelado");
}

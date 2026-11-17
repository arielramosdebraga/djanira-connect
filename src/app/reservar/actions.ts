"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/domains/contacts/phone";
import { parseSalonDateTime } from "@/lib/dates/salon";

export async function createPublicReservationAction(formData: FormData) {
  const requestedReturnTo = String(formData.get("returnTo") ?? "/reservar");
  const returnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//") ? requestedReturnTo : "/reservar";
  const serviceId = String(formData.get("serviceId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phoneInput = String(formData.get("phone") ?? "");
  const startsAtInput = String(formData.get("startsAt") ?? "");
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  if (!serviceId || !name || !idempotencyKey) redirect(`${returnTo}?erro=${encodeURIComponent("Preencha nome, telefone, serviço, data e horário.")}`);
  let phone: string; let startsAt: string;
  try { phone = normalizePhone(phoneInput); startsAt = parseSalonDateTime(startsAtInput); } catch (error) { redirect(`${returnTo}?erro=${encodeURIComponent(error instanceof Error ? error.message : "Confira os dados informados.")}`); }
  const { error } = await (await createClient()).rpc("create_public_reservation", { p_service_id: serviceId, p_customer_name: name, p_phone_normalized: phone, p_starts_at: startsAt, p_idempotency_key: idempotencyKey });
  if (error) {
    const knownError = error.message.includes("Horário") || error.message.includes("horário") || error.message.includes("Limite diário");
    redirect(`${returnTo}?erro=${encodeURIComponent(knownError ? error.message : "Não foi possível reservar esse horário.")}`);
  }
  redirect(`${returnTo}?resultado=reservado`);
}

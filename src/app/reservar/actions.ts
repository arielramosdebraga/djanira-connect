"use server";

import { normalizePhone } from "@domains/contacts/phone";
import { parseSalonDateTime } from "@lib/dates/salon";
import { submitPublicReservation } from "@lib/firebase/public";
import { redirect } from "next/navigation";

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
  try { await submitPublicReservation({ serviceId, name, phone, startsAt, idempotencyKey }); }
  catch (error) {
    const message = error instanceof Error ? error.message : "";
    const knownError = /Horário|horário|Limite diário|telefone|serviço|dia/i.test(message);
    redirect(`${returnTo}?erro=${encodeURIComponent(knownError ? message : "Não foi possível reservar esse horário.")}`);
  }
  redirect(`${returnTo}?resultado=reservado`);
}

"use server";

import { attendanceInputSchema } from "@domains/attendances/validation";
import { requireActiveMember } from "@lib/auth/session";
import { parseSalonDateTime } from "@lib/dates/salon";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAttendanceAction(formData: FormData) {
  const { membership, firebase } = await requireActiveMember();
  const parsed = attendanceInputSchema.safeParse({
    customerId: formData.get("customerId"),
    serviceId: formData.get("serviceId"),
    professionalId: formData.get("professionalId") || undefined,
    performedAt: formData.get("performedAt"),
    price: formData.get("price"),
    notes: formData.get("notes") || undefined,
    idempotencyKey: formData.get("idempotencyKey"),
  });
  if (!parsed.success) redirect(`/atendimentos?erro=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Confira os dados informados.")}`);

  let performedAt: string;
  try { performedAt = parseSalonDateTime(parsed.data.performedAt); } catch (error) { redirect(`/atendimentos?erro=${encodeURIComponent(error instanceof Error ? error.message : "Data inválida.")}`); }

  const { error } = await firebase.action("registerAttendance", {
    salonId: membership.organization_id,
    clientId: parsed.data.customerId,
    serviceId: parsed.data.serviceId,
    performedAt: performedAt,
    professionalId: parsed.data.professionalId || null,
    priceCents: parsed.data.price,
    notes: parsed.data.notes || null,
    idempotencyKey: parsed.data.idempotencyKey,
  });

  if (error) redirect(`/atendimentos?erro=${encodeURIComponent("Não foi possível registrar o atendimento.")}`);
  revalidatePath("/atendimentos");
  revalidatePath("/inicio");
  redirect("/atendimentos?resultado=criado");
}

export async function cancelAttendanceAction(formData: FormData) {
  const { membership, firebase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/atendimentos?erro=sem-permissao");
  const attendanceId = String(formData.get("attendanceId") ?? "");
  if (!attendanceId) redirect("/atendimentos?erro=atendimento-invalido");
  const { error } = await firebase.action("cancelAttendance", { attendanceId: attendanceId });
  if (error) redirect(`/atendimentos?erro=${encodeURIComponent(error.message.includes("permissão") ? error.message : "Não foi possível cancelar o atendimento.")}`);
  revalidatePath("/atendimentos");
  revalidatePath("/retornos");
  revalidatePath("/inicio");
  redirect("/atendimentos?resultado=cancelado");
}

export async function updateAttendanceAction(formData: FormData) {
  const { membership, firebase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/atendimentos?erro=sem-permissao");
  const attendanceId = String(formData.get("attendanceId") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const professionalId = String(formData.get("professionalId") ?? "").trim() || null;
  const performedAtInput = String(formData.get("performedAt") ?? "");
  const priceInput = String(formData.get("price") ?? "").trim();
  const normalizedPriceInput = priceInput.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const price = normalizedPriceInput ? Number(normalizedPriceInput) : null;
  if (!attendanceId || !customerId || !serviceId || !performedAtInput || (price !== null && (!Number.isFinite(price) || price < 0))) redirect(`/atendimentos/${attendanceId}?erro=Confira os dados informados.`);
  let performedAt: string;
  try { performedAt = parseSalonDateTime(performedAtInput); } catch (error) { redirect(`/atendimentos/${attendanceId}?erro=${encodeURIComponent(error instanceof Error ? error.message : "Data inválida.")}`); }
  const { error } = await firebase.action("updateAttendance", { attendanceId: attendanceId, clientId: customerId, serviceId: serviceId, performedAt: performedAt, professionalId: professionalId, priceCents: price === null ? null : Math.round(price * 100), notes: String(formData.get("notes") ?? "").trim() || null });
  if (error) redirect(`/atendimentos/${attendanceId}?erro=${encodeURIComponent(error.message.includes("permissão") ? error.message : "Não foi possível atualizar o atendimento.")}`);
  revalidatePath("/atendimentos"); revalidatePath(`/atendimentos/${attendanceId}`); revalidatePath("/retornos"); revalidatePath("/inicio");
  redirect(`/atendimentos/${attendanceId}?resultado=atualizado`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveMember } from "@/lib/auth/session";
import { attendanceInputSchema } from "@/domains/attendances/validation";
import { parseSalonDateTime } from "@/lib/dates/salon";

export async function createAttendanceAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
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

  const { error } = await supabase.rpc("register_attendance", {
    p_organization_id: membership.organization_id,
    p_customer_id: parsed.data.customerId,
    p_service_id: parsed.data.serviceId,
    p_performed_at: performedAt,
    p_professional_id: parsed.data.professionalId || null,
    p_price_cents: parsed.data.price,
    p_notes: parsed.data.notes || null,
    p_idempotency_key: parsed.data.idempotencyKey,
  });

  if (error) redirect(`/atendimentos?erro=${encodeURIComponent("Não foi possível registrar o atendimento.")}`);
  revalidatePath("/atendimentos");
  revalidatePath("/inicio");
  redirect("/atendimentos?resultado=criado");
}

export async function cancelAttendanceAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/atendimentos?erro=sem-permissao");
  const attendanceId = String(formData.get("attendanceId") ?? "");
  if (!attendanceId) redirect("/atendimentos?erro=atendimento-invalido");
  const { error } = await supabase.rpc("cancel_attendance", { p_attendance_id: attendanceId });
  if (error) redirect(`/atendimentos?erro=${encodeURIComponent(error.message.includes("permissão") ? error.message : "Não foi possível cancelar o atendimento.")}`);
  revalidatePath("/atendimentos");
  revalidatePath("/retornos");
  revalidatePath("/inicio");
  redirect("/atendimentos?resultado=cancelado");
}

export async function updateAttendanceAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
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
  const { error } = await supabase.rpc("update_attendance", { p_attendance_id: attendanceId, p_customer_id: customerId, p_service_id: serviceId, p_performed_at: performedAt, p_professional_id: professionalId, p_price_cents: price === null ? null : Math.round(price * 100), p_notes: String(formData.get("notes") ?? "").trim() || null });
  if (error) redirect(`/atendimentos/${attendanceId}?erro=${encodeURIComponent(error.message.includes("permissão") ? error.message : "Não foi possível atualizar o atendimento.")}`);
  revalidatePath("/atendimentos"); revalidatePath(`/atendimentos/${attendanceId}`); revalidatePath("/retornos"); revalidatePath("/inicio");
  redirect(`/atendimentos/${attendanceId}?resultado=atualizado`);
}

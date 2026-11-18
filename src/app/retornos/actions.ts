"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/session";

function fail(message: string): never { redirect(`/retornos?erro=${encodeURIComponent(message)}`); }

export async function recordContactAction(formData: FormData) {
  await requireActiveMember();
  const followUpId = String(formData.get("followUpId") ?? "");
  const notes = String(formData.get("notes") ?? "");
  if (!followUpId) fail("Retorno inválido.");
  const { error } = await (await createClient()).rpc("record_follow_up_contact", { p_follow_up_id: followUpId, p_notes: notes || null });
  if (error) fail("Não foi possível registrar o contato.");
  revalidatePath("/retornos"); revalidatePath("/contatos");
  redirect("/retornos?resultado=contato");
}

export async function postponeFollowUpAction(formData: FormData) {
  await requireActiveMember();
  const followUpId = String(formData.get("followUpId") ?? "");
  const nextDate = String(formData.get("nextDate") ?? "");
  if (!followUpId || !/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) fail("Informe uma data válida.");
  const { error } = await (await createClient()).rpc("postpone_follow_up", { p_follow_up_id: followUpId, p_next_date: nextDate });
  if (error) fail("Não foi possível adiar o retorno.");
  revalidatePath("/retornos");
  redirect("/retornos?resultado=adiado");
}

export async function dismissFollowUpAction(formData: FormData) {
  await requireActiveMember();
  const followUpId = String(formData.get("followUpId") ?? "");
  if (!followUpId) fail("Retorno inválido.");
  const { error } = await (await createClient()).rpc("dismiss_follow_up", { p_follow_up_id: followUpId });
  if (error) fail("Não foi possível dispensar o retorno.");
  revalidatePath("/retornos");
  redirect("/retornos?resultado=dispensado");
}

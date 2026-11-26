"use server";

import { requireActiveMember } from "@lib/auth/session";
import { createFirebaseServerClient } from "@lib/firebase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function fail(message: string): never { redirect(`/retornos?erro=${encodeURIComponent(message)}`); }

export async function recordContactAction(formData: FormData) {
  await requireActiveMember();
  const followUpId = String(formData.get("followUpId") ?? "");
  const notes = String(formData.get("notes") ?? "");
  if (!followUpId) fail("Retorno inválido.");
  const { error } = await (await createFirebaseServerClient()).action("recordFollowUpContact", { followUpId, notes: notes || null });
  if (error) fail("Não foi possível registrar o contato.");
  revalidatePath("/retornos"); revalidatePath("/contatos");
  redirect("/retornos?resultado=contato");
}

export async function postponeFollowUpAction(formData: FormData) {
  await requireActiveMember();
  const followUpId = String(formData.get("followUpId") ?? "");
  const nextDate = String(formData.get("nextDate") ?? "");
  if (!followUpId || !/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) fail("Informe uma data válida.");
  const { error } = await (await createFirebaseServerClient()).action("postponeFollowUp", { followUpId, nextDate });
  if (error) fail("Não foi possível adiar o retorno.");
  revalidatePath("/retornos");
  redirect("/retornos?resultado=adiado");
}

export async function dismissFollowUpAction(formData: FormData) {
  await requireActiveMember();
  const followUpId = String(formData.get("followUpId") ?? "");
  if (!followUpId) fail("Retorno inválido.");
  const { error } = await (await createFirebaseServerClient()).action("dismissFollowUp", { followUpId });
  if (error) fail("Não foi possível dispensar o retorno.");
  revalidatePath("/retornos");
  redirect("/retornos?resultado=dispensado");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/session";
import { normalizePhone } from "@/domains/contacts/phone";
import { contactInputSchema } from "@/domains/contacts/validation";

function redirectWithError(message: string): never {
  redirect(`/contatos?erro=${encodeURIComponent(message)}`);
}

export async function createContactAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
  const parsed = contactInputSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes") || undefined,
    doNotContact: formData.get("doNotContact") === "on",
  });

  if (!parsed.success) redirectWithError(parsed.error.issues[0]?.message ?? "Confira os dados informados.");

  let phoneNormalized: string;
  try { phoneNormalized = normalizePhone(parsed.data.phone); } catch (error) { redirectWithError(error instanceof Error ? error.message : "Informe um telefone válido."); }

  const { error: duplicateError } = await supabase.from("customers").select("id").eq("organization_id", membership.organization_id).eq("phone_normalized", phoneNormalized).limit(1);
  if (duplicateError) redirectWithError("Não foi possível verificar o telefone.");

  const { error } = await supabase.from("customers").insert({
    organization_id: membership.organization_id,
    name: parsed.data.name,
    phone_normalized: phoneNormalized,
    notes: parsed.data.notes || null,
    do_not_contact: parsed.data.doNotContact,
  });

  if (error) redirectWithError("Não foi possível cadastrar o contato.");
  revalidatePath("/contatos");
  redirect("/contatos?resultado=criado");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveMember } from "@/lib/auth/session";

export async function createProfessionalAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/configuracoes/profissionais?erro=sem-permissao");
  const name = String(formData.get("name") ?? "").trim();
  const rate = Number(String(formData.get("commissionRate") ?? "0").replace(",", "."));
  if (!name || !Number.isFinite(rate) || rate < 0 || rate > 100) redirect("/configuracoes/profissionais?erro=Informe nome e percentual entre 0 e 100.");
  const { error } = await supabase.from("professionals").insert({ organization_id: membership.organization_id, name, default_commission_rate: rate });
  if (error) redirect(`/configuracoes/profissionais?erro=${encodeURIComponent(error.code === "23505" ? "Já existe um profissional com esse nome." : "Não foi possível cadastrar o profissional.")}`);
  revalidatePath("/configuracoes/profissionais");
  revalidatePath("/atendimentos");
  revalidatePath("/relatorios");
  redirect("/configuracoes/profissionais?resultado=cadastrado");
}

export async function toggleProfessionalAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/configuracoes/profissionais?erro=sem-permissao");
  const id = String(formData.get("professionalId") ?? "");
  const active = String(formData.get("active") ?? "false") === "true";
  if (!id) redirect("/configuracoes/profissionais?erro=Profissional inválido.");
  const { error } = await supabase.from("professionals").update({ active: !active, updated_at: new Date().toISOString() }).eq("id", id).eq("organization_id", membership.organization_id);
  if (error) redirect("/configuracoes/profissionais?erro=Não foi possível atualizar o profissional.");
  revalidatePath("/configuracoes/profissionais");
  revalidatePath("/atendimentos");
  revalidatePath("/relatorios");
  redirect("/configuracoes/profissionais?resultado=atualizado");
}

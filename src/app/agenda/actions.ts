"use server";

import { requireActiveMember } from "@lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const weekdays = [0, 1, 2, 3, 4, 5, 6];

export async function saveAvailabilityAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/configuracoes?erro=sem-permissao");
  const rules = weekdays.flatMap((weekday) => {
    if (formData.get(`enabled_${weekday}`) !== "on") return [];
    return [{ weekday, startTime: "09:00", endTime: "18:00", breakStart: "", breakEnd: "" }];
  });
  const { error } = await supabase.rpc("save_availability_rules", { p_organization_id: membership.organization_id, p_rules: rules });
  if (error) redirect("/configuracoes?erro=Não foi possível salvar os horários.");
  revalidatePath("/agenda"); revalidatePath("/configuracoes"); revalidatePath("/reservar");
  redirect("/configuracoes?resultado=salvo");
}

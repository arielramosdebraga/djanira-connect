"use server";

import { requireActiveMember } from "@lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const weekdays = [0, 1, 2, 3, 4, 5, 6];

export async function saveAvailabilityAction(formData: FormData) {
  const { membership, firebase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/configuracoes?erro=sem-permissao");
  const rules = weekdays.flatMap((weekday) => {
    if (formData.get(`enabled_${weekday}`) !== "on") return [];
    return [{ weekday, startTime: "09:00", endTime: "18:00", breakStart: "", breakEnd: "" }];
  });
  const { error } = await firebase.action("saveAvailabilityRules", { salonId: membership.organization_id, rules: rules });
  if (error) redirect("/configuracoes?erro=Não foi possível salvar os horários.");
  revalidatePath("/agenda"); revalidatePath("/configuracoes"); revalidatePath("/reservar");
  redirect("/configuracoes?resultado=salvo");
}

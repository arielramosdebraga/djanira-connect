"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/session";

const weekdays = [0, 1, 2, 3, 4, 5, 6];

export async function saveAvailabilityAction(formData: FormData) {
  const { membership, supabase } = await requireActiveMember();
  if (membership.role !== "admin") redirect("/agenda?erro=sem-permissao");
  const rules = weekdays.flatMap((weekday) => {
    if (formData.get(`enabled_${weekday}`) !== "on") return [];
    return [{ weekday, startTime: String(formData.get(`start_${weekday}`) ?? ""), endTime: String(formData.get(`end_${weekday}`) ?? ""), breakStart: String(formData.get(`break_start_${weekday}`) ?? ""), breakEnd: String(formData.get(`break_end_${weekday}`) ?? "") }];
  });
  if (rules.some((rule) => !/^\d{2}:\d{2}$/.test(rule.startTime) || !/^\d{2}:\d{2}$/.test(rule.endTime))) redirect("/agenda?erro=horarios-invalidos");
  const { error } = await supabase.rpc("save_availability_rules", { p_organization_id: membership.organization_id, p_rules: rules });
  if (error) redirect("/agenda?erro=nao-foi-possivel-salvar");
  revalidatePath("/agenda");
  redirect("/agenda?resultado=salvo");
}

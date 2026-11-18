import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireActiveMember() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) redirect("/login");

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", data.claims.sub)
    .eq("active", true)
    .maybeSingle();

  if (membershipError || !membership) redirect("/login?erro=sem-acesso");

  return { supabase, userId: data.claims.sub, membership };
}

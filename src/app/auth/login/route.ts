import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectUrl = new URL("/inicio", request.url);
  if (!email || !password) { redirectUrl.pathname = "/login"; redirectUrl.searchParams.set("erro", "preencha-os-dados"); return NextResponse.redirect(redirectUrl); }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { redirectUrl.pathname = "/login"; redirectUrl.searchParams.set("erro", "credenciais-invalidas"); }
    return NextResponse.redirect(redirectUrl);
  } catch { redirectUrl.pathname = "/login"; redirectUrl.searchParams.set("erro", "configuracao-indisponivel"); return NextResponse.redirect(redirectUrl); }
}

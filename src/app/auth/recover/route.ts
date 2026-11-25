import { createClient } from "@lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const redirectUrl = new URL("/recuperar-acesso", request.url);

  if (!email) {
    redirectUrl.searchParams.set("erro", "email-obrigatorio");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/auth/callback?next=/redefinir-senha", request.url).toString(),
    });
    redirectUrl.searchParams.set("resultado", error ? "falha" : "enviado");
  } catch {
    redirectUrl.searchParams.set("resultado", "falha");
  }

  return NextResponse.redirect(redirectUrl);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try { const supabase = await createClient(); await supabase.auth.signOut(); } catch { /* Sessão já pode estar ausente. */ }
  return NextResponse.redirect(new URL("/login", request.url));
}

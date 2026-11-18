import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ValidationMessages from "@/components/forms/validation-messages";
import AppShell from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Djanira Connect", template: "%s | Djanira Connect" },
  description: "Gestão de clientes, atendimentos e retornos do salão.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data?.claims?.sub);
  return <html lang="pt-BR"><body><ValidationMessages /><AppShell authenticated={authenticated}>{children}</AppShell></body></html>;
}

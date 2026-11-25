import "./globals.css";

import ValidationMessages from "@components/forms/validation-messages";
import AppShell from "@components/layout/app-shell";
import { getFirebaseSession } from "@lib/firebase/session";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Djanira Connect", template: "%s | Djanira Connect" },
  description: "Gestão de clientes, atendimentos e retornos do salão.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getFirebaseSession();
  const authenticated = Boolean(session?.userId);
  return <html lang="pt-BR"><body><ValidationMessages /><AppShell authenticated={authenticated}>{children}</AppShell></body></html>;
}

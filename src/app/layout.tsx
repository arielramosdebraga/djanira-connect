import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ValidationMessages from "@/components/forms/validation-messages";

export const metadata: Metadata = {
  title: { default: "Djanira Connect", template: "%s | Djanira Connect" },
  description: "Gestão de clientes, atendimentos e retornos do salão.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body><ValidationMessages />{children}</body></html>;
}

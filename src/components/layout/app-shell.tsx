"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

const navigation = [
  ["Início", "/inicio"],
  ["Agenda", "/agenda"],
  ["Contatos", "/contatos"],
  ["Atendimentos", "/atendimentos"],
  ["Relatórios", "/relatorios"],
  ["Retornos", "/retornos"],
  ["Serviços", "/servicos"],
  ["Configurações", "/configuracoes"],
] as const;

function isPublicPath(pathname: string) { return pathname === "/" || pathname === "/login" || pathname.startsWith("/recuperar-acesso") || pathname.startsWith("/reservar") || pathname.startsWith("/auth/"); }

function NavigationLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <nav className="mt-8 space-y-1" aria-label="Navegação principal">{navigation.map(([label, href]) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} onClick={onNavigate} className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-[#faf0f4] text-[#8f4e68]" : "text-[#716963] hover:bg-[#faf5f7] hover:text-[#8f4e68]"}`}>{label}</Link>; })}</nav>;
}

function BrandMark({ compact = false }: { compact?: boolean }) { return <Image src="/brand/djanira-mark.png" alt="Djanira Connect" width={compact ? 56 : 88} height={compact ? 56 : 88} className={compact ? "h-14 w-14 object-contain" : "h-[5.5rem] w-[5.5rem] object-contain"} priority />; }

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (isPublicPath(pathname)) return children;
  return <div className="min-h-screen lg:flex"><aside className="sticky top-0 z-30 hidden h-screen w-60 shrink-0 border-r border-[#e8e1dc] bg-white p-5 lg:block"><Link href="/inicio" className="flex justify-center px-4" aria-label="Djanira Connect"><BrandMark /></Link><NavigationLinks pathname={pathname} /><Link className="mt-8 block rounded-xl border border-[#d9cec8] px-4 py-3 text-center text-sm font-semibold text-[#716963] hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/auth/logout">Sair</Link></aside><div className="min-w-0 flex-1"><div className="border-b border-[#e8e1dc] bg-white px-5 py-3 lg:hidden"><div className="flex items-center justify-between"><Link href="/inicio" aria-label="Djanira Connect"><BrandMark compact /></Link><button className="rounded-xl border border-[#d9cec8] px-4 py-2 text-sm font-semibold" type="button" aria-expanded={open} aria-controls="global-mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? "Fechar menu" : "Menu"}</button></div>{open ? <div id="global-mobile-navigation" className="pb-2"><NavigationLinks pathname={pathname} onNavigate={() => setOpen(false)} /><Link className="mt-4 block border-t border-[#eee8e3] px-4 pt-4 text-sm font-semibold text-[#716963]" href="/auth/logout">Sair</Link></div> : null}</div>{children}</div></div>;
}

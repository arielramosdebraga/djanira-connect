"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

const navigation = [
  ["Início", "/inicio"],
  ["Agenda", "/agenda"],
  ["Contatos", "/contatos"],
  ["Atendimentos", "/atendimentos"],
  ["Retornos", "/retornos"],
  ["Serviços", "/servicos"],
  ["Configurações", "/configuracoes"],
] as const;

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/login" || pathname.startsWith("/recuperar-acesso") || pathname.startsWith("/reservar") || pathname.startsWith("/auth/");
}

function NavigationLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <nav className="mt-8 space-y-1" aria-label="Navegação principal">{navigation.map(([label, href]) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} onClick={onNavigate} className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-[#faf0f4] text-[#8f4e68]" : "text-[#716963] hover:bg-[#faf5f7] hover:text-[#8f4e68]"}`}>{label}</Link>; })}</nav>;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (isPublicPath(pathname)) return children;
  return <div className="min-h-screen lg:flex"><aside className="sticky top-0 z-30 hidden h-screen w-60 shrink-0 border-r border-[#e8e1dc] bg-white p-5 lg:block"><Link href="/inicio" className="block px-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8f4e68]">Djanira</p><p className="mt-1 text-lg font-semibold text-[#29231f]">Connect</p></Link><NavigationLinks pathname={pathname} /><Link className="mt-8 block rounded-xl border border-[#d9cec8] px-4 py-3 text-center text-sm font-semibold text-[#716963] hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/auth/logout">Sair</Link></aside><div className="min-w-0 flex-1"><div className="border-b border-[#e8e1dc] bg-white px-5 py-4 lg:hidden"><div className="flex items-center justify-between"><Link href="/inicio"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8f4e68]">Djanira Connect</p></Link><button className="rounded-xl border border-[#d9cec8] px-4 py-2 text-sm font-semibold" type="button" aria-expanded={open} aria-controls="global-mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? "Fechar menu" : "Menu"}</button></div>{open ? <div id="global-mobile-navigation" className="pb-2"><NavigationLinks pathname={pathname} onNavigate={() => setOpen(false)} /><Link className="mt-4 block border-t border-[#eee8e3] px-4 pt-4 text-sm font-semibold text-[#716963]" href="/auth/logout">Sair</Link></div> : null}</div>{children}</div></div>;
}

"use client";

import Link from "next/link";
import { useState } from "react";

const navigation = [
  ["Início", "/inicio"],
  ["Agenda", "/agenda"],
  ["Contatos", "/contatos"],
  ["Atendimentos", "/atendimentos"],
  ["Retornos", "/retornos"],
  ["Serviços", "/servicos"],
  ["Configurações", "/configuracoes"],
] as const;

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return <nav className="mt-8 space-y-1" aria-label="Navegação principal">{navigation.map(([label, href]) => <Link key={href} href={href} onClick={onNavigate} className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${href === "/inicio" ? "bg-[#faf0f4] text-[#8f4e68]" : "text-[#716963] hover:bg-[#faf5f7] hover:text-[#8f4e68]"}`}>{label}</Link>)}</nav>;
}

export default function DashboardNavigation() {
  const [open, setOpen] = useState(false);
  return <>
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 rounded-[2rem] border border-[#e8e1dc] bg-white p-5 lg:block"><Link href="/inicio" className="block px-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8f4e68]">Djanira</p><p className="mt-1 text-lg font-semibold text-[#29231f]">Connect</p></Link><NavigationLinks /><Link className="mt-8 block rounded-xl border border-[#d9cec8] px-4 py-3 text-center text-sm font-semibold text-[#716963] hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/auth/logout">Sair</Link></aside>
    <div className="mb-6 flex items-center justify-between lg:hidden"><Link href="/inicio"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8f4e68]">Djanira Connect</p></Link><button className="rounded-xl border border-[#d9cec8] bg-white px-4 py-2.5 text-sm font-semibold" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? "Fechar menu" : "Menu"}</button></div>
    {open ? <div id="mobile-navigation" className="mb-6 rounded-2xl border border-[#e8e1dc] bg-white p-4 lg:hidden"><NavigationLinks onNavigate={() => setOpen(false)} /><Link className="mt-4 block border-t border-[#eee8e3] px-4 pt-4 text-sm font-semibold text-[#716963]" href="/auth/logout">Sair</Link></div> : null}
  </>;
}

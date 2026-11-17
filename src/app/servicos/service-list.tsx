"use client";

import { useMemo, useState } from "react";
import { toggleServiceAction } from "@/app/servicos/actions";

type Service = { id: string; name: string; average_price_cents: number | null; duration_minutes: number; return_period_days: number | null; active: boolean };

function formatPrice(cents: number | null) {
  if (cents === null) return "Não informado";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default function ServiceList({ services, isAdmin }: { services: Service[]; isAdmin: boolean }) {
  const [search, setSearch] = useState("");
  const filteredServices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return query ? services.filter((service) => service.name.toLocaleLowerCase("pt-BR").includes(query)) : services;
  }, [search, services]);

  return <section className="mt-8 rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Catálogo</p><h2 className="mt-2 text-2xl font-semibold">Serviços cadastrados</h2><p className="mt-1 text-sm text-[#716963]">Pesquise e gerencie os serviços oferecidos pelo salão.</p></div><p className="rounded-full bg-[#faf0f4] px-3.5 py-2 text-sm font-semibold text-[#8f4e68]">{filteredServices.length} resultado(s)</p></div>
    <div className="mt-6"><label className="block"><span className="sr-only">Pesquisar serviço</span><input className="w-full rounded-xl border border-[#d9cec8] bg-[#fcfbfa] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:bg-white" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite o nome do serviço..." aria-label="Pesquisar serviços por nome" /></label></div>
    {filteredServices.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{filteredServices.map((service) => <article className="rounded-2xl border border-[#eee8e3] p-4" key={service.id}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{service.name}</h3><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${service.active ? "bg-[#edf8f0] text-[#287342]" : "bg-[#f1eeeb] text-[#716963]"}`}>{service.active ? "Ativo" : "Inativo"}</span></div><p className="mt-2 text-sm text-[#716963]">{service.duration_minutes} min · {formatPrice(service.average_price_cents)} · {service.return_period_days ? `retorno em ${service.return_period_days} dias` : "sem retorno automático"}</p></div>{isAdmin ? <form action={toggleServiceAction}><input type="hidden" name="serviceId" value={service.id} /><input type="hidden" name="active" value={String(service.active)} /><button className="shrink-0 text-sm font-semibold text-[#8f4e68] hover:underline" type="submit">{service.active ? "Desativar" : "Ativar"}</button></form> : null}</div></article>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-[#d9cec8] bg-[#fcfbfa] p-8 text-center"><p className="font-semibold text-[#69344b]">Nenhum serviço encontrado</p><p className="mt-1 text-sm text-[#716963]">Tente pesquisar por outro nome.</p></div>}
  </section>;
}

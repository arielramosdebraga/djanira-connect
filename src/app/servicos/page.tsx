import Link from "next/link";
import { createServiceAction, toggleServiceAction } from "@/app/servicos/actions";
import { requireActiveMember } from "@/lib/auth/session";

type ServicesPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };

function formatPrice(cents: number | null) {
  if (cents === null) return "Não informado";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export const metadata = { title: "Serviços" };

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { membership, supabase } = await requireActiveMember();
  const params = await searchParams;
  const { data: services, error } = await supabase.from("services").select("id, name, average_price_cents, duration_minutes, return_period_days, active").eq("organization_id", membership.organization_id).order("active", { ascending: false }).order("name");
  const isAdmin = membership.role === "admin";

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4"><div><Link className="text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><h1 className="mt-3 text-3xl font-semibold">Serviços</h1><p className="mt-2 text-[#716963]">Organize o catálogo usado nos atendimentos.</p></div><Link className="rounded-full border border-[#d9cec8] px-5 py-2.5 text-sm font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/auth/logout">Sair</Link></header>
        {params.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{params.erro === "sem-permissao" ? "Somente administradores podem alterar serviços." : params.erro}</p> : null}
        {params.resultado ? <p className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">Alteração realizada com sucesso.</p> : null}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          {isAdmin ? <section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Novo serviço</h2><p className="mt-2 text-sm leading-6 text-[#716963]">O prazo de retorno é opcional e alimenta os lembretes.</p><form className="mt-6 space-y-4" action={createServiceAction}><label className="block text-sm font-medium">Nome<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="name" required /></label><label className="block text-sm font-medium">Valor médio<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="averagePrice" inputMode="decimal" placeholder="Ex.: 80,00" /></label><label className="block text-sm font-medium">Duração média (minutos)<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="durationMinutes" type="number" min="1" required /></label><label className="block text-sm font-medium">Prazo de retorno (dias)<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="returnPeriodDays" type="number" min="1" /></label><button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b]" type="submit">Cadastrar serviço</button></form></section> : <section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Catálogo</h2><p className="mt-2 text-sm leading-6 text-[#716963]">Seu perfil pode consultar os serviços disponíveis.</p></section>}
          <section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Catálogo cadastrado</h2><p className="mt-2 text-sm text-[#716963]">{services?.length ?? 0} serviço(s)</p></div></div>{error ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]">Não foi possível carregar os serviços.</p> : services?.length ? <div className="mt-6 space-y-3">{services.map((service) => <article className="rounded-2xl border border-[#eee8e3] p-4" key={service.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h3 className="font-semibold">{service.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${service.active ? "bg-[#edf8f0] text-[#287342]" : "bg-[#f1eeeb] text-[#716963]"}`}>{service.active ? "Ativo" : "Inativo"}</span></div><p className="mt-2 text-sm text-[#716963]">{service.duration_minutes} min · {formatPrice(service.average_price_cents)} · {service.return_period_days ? `retorno em ${service.return_period_days} dias` : "sem retorno automático"}</p></div>{isAdmin ? <form action={toggleServiceAction}><input type="hidden" name="serviceId" value={service.id} /><input type="hidden" name="active" value={String(service.active)} /><button className="text-sm font-semibold text-[#8f4e68] hover:underline" type="submit">{service.active ? "Desativar" : "Ativar"}</button></form> : null}</div></article>)}</div> : <div className="mt-6 rounded-2xl bg-[#faf5f7] p-6 text-sm leading-6 text-[#69344b]">Nenhum serviço cadastrado ainda.</div>}</section>
        </div>
      </div>
    </main>
  );
}

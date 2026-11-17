import Link from "next/link";
import { requireActiveMember } from "@/lib/auth/session";
import DashboardCalendar from "@/app/inicio/dashboard-calendar";
import DashboardAppointmentModal from "@/app/inicio/dashboard-appointment-modal";
import { createAppointmentAction } from "@/app/agenda/appointment-actions";

export const metadata = { title: "Início" };
export const instant = false;

type DashboardPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { membership, supabase } = await requireActiveMember();
  const params = await searchParams;
  const [{ data: appointments }, { data: customers }, { data: services }] = await Promise.all([
    supabase.from("appointments").select("id, starts_at, ends_at, status, customers(name), services(name)").eq("organization_id", membership.organization_id).order("starts_at").limit(100),
    supabase.from("customers").select("id, name, phone_normalized").eq("organization_id", membership.organization_id).eq("status", "active").order("name"),
    supabase.from("services").select("id, name").eq("organization_id", membership.organization_id).eq("active", true).order("name"),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8f4e68]">Djanira Connect</p><h1 className="mt-2 text-3xl font-semibold">Início</h1></div><Link className="rounded-full border border-[#d9cec8] px-5 py-2.5 text-sm font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/auth/logout">Sair</Link></header>
        {params.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm leading-6 text-[#9b3e3e]" role="alert">{params.erro}</p> : null}{params.resultado ? <p className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm leading-6 text-[#287342]" role="status">Agendamento criado com sucesso.</p> : null}<section className="mt-10 rounded-[2rem] border border-[#e8e1dc] bg-white p-7 sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Primeiros módulos</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Organize sua rotina do salão.</h2><p className="mt-4 max-w-2xl leading-7 text-[#716963]">A estrutura inicial está pronta para cadastrar serviços, contatos e atendimentos.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="rounded-xl bg-[#8f4e68] px-5 py-3 font-semibold text-white hover:bg-[#69344b]" href="/servicos">Gerenciar serviços</Link><Link className="rounded-xl border border-[#d9cec8] px-5 py-3 font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/contatos">Gerenciar contatos</Link><Link className="rounded-xl border border-[#d9cec8] px-5 py-3 font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/atendimentos">Registrar atendimento</Link><Link className="rounded-xl border border-[#d9cec8] px-5 py-3 font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/retornos">Ver retornos</Link><Link className="rounded-xl border border-[#d9cec8] px-5 py-3 font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/configuracoes">Configurações</Link><Link className="rounded-xl border border-[#d9cec8] px-5 py-3 font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/agenda">Agenda</Link></div></section>
        <div className="mt-8 flex justify-end"><DashboardAppointmentModal action={createAppointmentAction} customers={customers ?? []} services={services ?? []} /></div>
        <DashboardCalendar appointments={appointments ?? []} />
      </div>
    </main>
  );
}

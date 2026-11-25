import { createAppointmentAction } from "@app/agenda/appointment-actions";
import DashboardAppointmentModal from "@app/inicio/dashboard-appointment-modal";
import DashboardCalendar from "@app/inicio/dashboard-calendar";
import { requireActiveMember } from "@lib/auth/session";
import Link from "next/link";

type AgendaPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };
export const metadata = { title: "Agenda" };
export const instant = false;

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { membership, supabase } = await requireActiveMember();
  const params = await searchParams;
  const [{ data: customers }, { data: services }, { data: appointments }] = await Promise.all([
    supabase.from("customers").select("id, name, phone_normalized").eq("organization_id", membership.organization_id).eq("status", "active").order("name"),
    supabase.from("services").select("id, name").eq("organization_id", membership.organization_id).eq("active", true).order("name"),
    supabase.from("appointments").select("id, starts_at, ends_at, status, customers(name), services(name)").eq("organization_id", membership.organization_id).order("starts_at").limit(100),
  ]);
  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-end justify-between gap-4"><div><Link className="text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><h1 className="mt-3 text-3xl font-semibold">Agenda</h1><p className="mt-2 text-[#716963]">Visualize e organize os compromissos do salão.</p></div><DashboardAppointmentModal action={createAppointmentAction} customers={customers ?? []} services={services ?? []} returnTo="/agenda" /></header>{params.erro ? <p className="mt-6 rounded-xl border border-[#f0caca] bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{params.erro === "sem-permissao" ? "Somente administradores podem alterar esta configuração." : params.erro}</p> : null}{params.resultado ? <p className="mt-6 rounded-xl border border-[#cce8d3] bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">{params.resultado === "compromisso-criado" ? "Agendamento criado com sucesso." : "Compromisso cancelado com sucesso."}</p> : null}<DashboardCalendar appointments={appointments ?? []} /></div></main>;
}

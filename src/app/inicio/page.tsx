import Link from "next/link";
import { requireActiveMember } from "@/lib/auth/session";
import DashboardCalendar from "@/app/inicio/dashboard-calendar";
import DashboardAppointmentModal from "@/app/inicio/dashboard-appointment-modal";
import DashboardNavigation from "@/app/inicio/dashboard-navigation";
import DashboardPublicReservationModal from "@/app/inicio/dashboard-public-reservation-modal";
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
    supabase.from("services").select("id, name, duration_minutes").eq("organization_id", membership.organization_id).eq("active", true).order("name"),
  ]);
  const publicServices = (services ?? []).map((service) => ({ service_id: service.id, service_name: service.name, duration_minutes: service.duration_minutes }));

  return <main className="min-h-screen bg-[#f8f7f4] px-5 py-5 text-[#29231f] sm:px-8 sm:py-8"><div className="mx-auto flex max-w-[1440px] gap-8"><DashboardNavigation /><div className="min-w-0 flex-1"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Área de gestão</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Olá, equipe Djanira.</h1><p className="mt-2 text-[#716963]">Organize a rotina do salão em um só lugar.</p></div><div className="hidden items-center gap-3 lg:flex"><DashboardPublicReservationModal services={publicServices} /><DashboardAppointmentModal action={createAppointmentAction} customers={customers ?? []} services={services ?? []} /></div></header>
        {params.erro ? <p className="mt-6 rounded-xl border border-[#f0caca] bg-[#fff1f1] p-4 text-sm leading-6 text-[#9b3e3e]" role="alert">{params.erro}</p> : null}{params.resultado ? <p className="mt-6 rounded-xl border border-[#cce8d3] bg-[#edf8f0] p-4 text-sm leading-6 text-[#287342]" role="status">{params.resultado === "reservado" ? "Solicitação de reserva recebida com sucesso." : "Agendamento criado com sucesso."}</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-3"><Link className="rounded-2xl border border-[#e6cbd6] bg-[#faf0f4] p-5 transition hover:-translate-y-0.5" href="/agenda"><p className="text-sm font-semibold text-[#8f4e68]">Agenda</p><p className="mt-2 text-2xl font-semibold">{appointments?.length ?? 0}</p><p className="mt-1 text-sm text-[#716963]">compromissos carregados</p></Link><Link className="rounded-2xl border border-[#e8e1dc] bg-white p-5 transition hover:-translate-y-0.5" href="/contatos"><p className="text-sm font-semibold text-[#8f4e68]">Contatos</p><p className="mt-2 text-2xl font-semibold">{customers?.length ?? 0}</p><p className="mt-1 text-sm text-[#716963]">clientes ativos</p></Link><Link className="rounded-2xl border border-[#e8e1dc] bg-white p-5 transition hover:-translate-y-0.5" href="/servicos"><p className="text-sm font-semibold text-[#8f4e68]">Serviços</p><p className="mt-2 text-2xl font-semibold">{services?.length ?? 0}</p><p className="mt-1 text-sm text-[#716963]">serviços ativos</p></Link></div>
        <div className="mt-8 flex justify-stretch gap-3 lg:hidden"><DashboardPublicReservationModal services={publicServices} /><DashboardAppointmentModal action={createAppointmentAction} customers={customers ?? []} services={services ?? []} /></div>
        <DashboardCalendar appointments={appointments ?? []} />
      </div></div></main>;
}

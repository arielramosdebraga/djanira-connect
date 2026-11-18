import { requireActiveMember } from "@/lib/auth/session";
import DashboardCalendar from "@/app/inicio/dashboard-calendar";
import DashboardAppointmentModal from "@/app/inicio/dashboard-appointment-modal";
import DashboardPublicReservationModal from "@/app/inicio/dashboard-public-reservation-modal";
import { DashboardContactsSection, DashboardFollowUpsSection } from "@/app/inicio/dashboard-contacts-follow-ups";
import DashboardAppointmentsSummary from "@/app/inicio/dashboard-appointments-summary";
import DashboardRevenue from "@/app/inicio/dashboard-revenue";
import { createAppointmentAction } from "@/app/agenda/appointment-actions";
import { addCalendarDays, getSalonToday } from "@/lib/dates/salon-calendar";

export const metadata = { title: "Início" };
export const instant = false;
type DashboardPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { membership, supabase } = await requireActiveMember();
  const params = await searchParams;
  const today = getSalonToday();
  const endDate = addCalendarDays(today, 7);
  const [{ data: appointments }, { data: customers }, { data: services }, { data: followUps }, { data: revenueAttendances }] = await Promise.all([
    supabase.from("appointments").select("id, starts_at, ends_at, status, customers(name), services(name)").eq("organization_id", membership.organization_id).order("starts_at").limit(100),
    supabase.from("customers").select("id, name, phone_normalized").eq("organization_id", membership.organization_id).eq("status", "active").order("name"),
    supabase.from("services").select("id, name, duration_minutes").eq("organization_id", membership.organization_id).eq("active", true).order("name"),
    supabase.from("follow_ups").select("id, next_follow_up_date, status, customers(name, phone_normalized, do_not_contact, status), services(name)").eq("organization_id", membership.organization_id).in("status", ["pending", "postponed"]).lte("next_follow_up_date", endDate).order("next_follow_up_date").limit(20),
    supabase.from("attendances").select("performed_at, price_cents, status").eq("organization_id", membership.organization_id).eq("status", "completed").gte("performed_at", `${today.slice(0, 7)}-01T00:00:00-03:00`).lte("performed_at", `${today}T23:59:59-03:00`).limit(200),
  ]);
  const publicServices = (services ?? []).map((service) => ({ service_id: service.id, service_name: service.name, duration_minutes: service.duration_minutes }));

  return <main className="min-h-screen bg-[#f8f7f4] px-5 py-5 text-[#29231f] sm:px-8 sm:py-8"><div className="mx-auto max-w-[1200px]">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Área de gestão</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Olá, equipe Djanira.</h1><p className="mt-2 text-[#716963]">Organize a rotina do salão em um só lugar.</p></div><div className="hidden items-center gap-3 lg:flex"><DashboardPublicReservationModal services={publicServices} /><DashboardAppointmentModal action={createAppointmentAction} customers={customers ?? []} services={services ?? []} /></div></header>
    {params.erro ? <p className="mt-6 rounded-xl border border-[#f0caca] bg-[#fff1f1] p-4 text-sm leading-6 text-[#9b3e3e]" role="alert">{params.erro}</p> : null}
    {params.resultado ? <p className="mt-6 rounded-xl border border-[#cce8d3] bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">{params.resultado === "reservado" ? "Solicitação de reserva recebida com sucesso." : "Agendamento criado com sucesso."}</p> : null}
    <DashboardRevenue attendances={revenueAttendances ?? []} />
    <div className="mt-8 flex justify-stretch gap-3 lg:hidden"><DashboardPublicReservationModal services={publicServices} /><DashboardAppointmentModal action={createAppointmentAction} customers={customers ?? []} services={services ?? []} /></div>
    <DashboardContactsSection contacts={customers ?? []} />
    <DashboardAppointmentsSummary appointments={appointments ?? []} />
    <DashboardCalendar appointments={appointments ?? []} />
    <DashboardFollowUpsSection followUps={followUps ?? []} />
  </div></main>;
}

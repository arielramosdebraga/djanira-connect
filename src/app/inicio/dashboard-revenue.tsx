import Link from "next/link";
import { getSalonMonthStart, getSalonToday, getSalonWeekStart } from "@/lib/dates/salon-calendar";

type RevenueAttendance = { performed_at: string; price_cents: number | null; status: string };

function localDate(value: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value)); }
function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }

export default function DashboardRevenue({ attendances }: { attendances: RevenueAttendance[] }) {
  const today = getSalonToday();
  const weekStart = getSalonWeekStart(today);
  const monthStart = getSalonMonthStart(today);
  const weekAttendances = attendances.filter((item) => { const date = localDate(item.performed_at); return date >= weekStart && date <= today; });
  const monthAttendances = attendances.filter((item) => { const date = localDate(item.performed_at); return date >= monthStart && date <= today; });
  const total = (items: RevenueAttendance[]) => items.reduce((sum, item) => sum + (item.price_cents ?? 0), 0);

  return <section className="mt-8 grid gap-4 sm:grid-cols-2"><Link className="rounded-[2rem] border border-[#e6cbd6] bg-[#faf0f4] p-5 transition hover:-translate-y-0.5" href="/relatorios"><p className="text-sm font-semibold text-[#8f4e68]">Arrecadação da semana</p><p className="mt-2 text-3xl font-semibold">{money(total(weekAttendances))}</p><p className="mt-1 text-sm text-[#716963]">{weekAttendances.length} atendimento(s) concluído(s)</p></Link><Link className="rounded-[2rem] border border-[#e8e1dc] bg-white p-5 transition hover:-translate-y-0.5" href="/relatorios"><p className="text-sm font-semibold text-[#8f4e68]">Arrecadação do mês</p><p className="mt-2 text-3xl font-semibold">{money(total(monthAttendances))}</p><p className="mt-1 text-sm text-[#716963]">{monthAttendances.length} atendimento(s) concluído(s)</p></Link></section>;
}

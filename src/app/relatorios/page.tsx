import Link from "next/link";
import { requireActiveMember } from "@/lib/auth/session";
import { getSalonMonthStart, getSalonToday, getSalonWeekStart } from "@/lib/dates/salon-calendar";

export const metadata = { title: "Relatórios" };
export const instant = false;

function localDate(value: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value)); }
function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
function dateTime(value: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }

export default async function ReportsPage() {
  const { membership, supabase } = await requireActiveMember();
  const today = getSalonToday();
  const monthStart = getSalonMonthStart(today);
  const weekStart = getSalonWeekStart(today);
  const { data: attendances, error } = await supabase.from("attendances").select("id, performed_at, service_name_snapshot, price_cents, customers(name)").eq("organization_id", membership.organization_id).eq("status", "completed").gte("performed_at", `${monthStart}T00:00:00-03:00`).lte("performed_at", `${today}T23:59:59-03:00`).order("performed_at", { ascending: false }).limit(200);
  const items = attendances ?? [];
  const weekItems = items.filter((item) => { const date = localDate(item.performed_at); return date >= weekStart && date <= today; });
  const total = (rows: typeof items) => rows.reduce((sum, item) => sum + (item.price_cents ?? 0), 0);

  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10"><div className="mx-auto max-w-6xl"><header><Link className="text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><h1 className="mt-3 text-3xl font-semibold">Relatórios</h1><p className="mt-2 text-[#716963]">Acompanhe a arrecadação e o volume de atendimentos do salão.</p></header>{error ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]">Não foi possível carregar os relatórios.</p> : <><section className="mt-8 grid gap-4 sm:grid-cols-2"><article className="rounded-[2rem] border border-[#e6cbd6] bg-[#faf0f4] p-6"><p className="text-sm font-semibold text-[#8f4e68]">Arrecadação da semana</p><p className="mt-3 text-3xl font-semibold">{money(total(weekItems))}</p><p className="mt-2 text-sm text-[#716963]">{weekItems.length} atendimento(s) concluído(s)</p></article><article className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6"><p className="text-sm font-semibold text-[#8f4e68]">Arrecadação do mês</p><p className="mt-3 text-3xl font-semibold">{money(total(items))}</p><p className="mt-2 text-sm text-[#716963]">{items.length} atendimento(s) concluído(s)</p></article></section><section className="mt-8 rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Detalhamento</p><h2 className="mt-2 text-2xl font-semibold">Atendimentos do mês</h2></div><p className="rounded-full bg-[#faf0f4] px-3.5 py-2 text-sm font-semibold text-[#8f4e68]">{items.length} registro(s)</p></div>{items.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{items.map((item) => <article className="rounded-2xl border border-[#eee8e3] p-4" key={item.id}><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{item.customers?.[0]?.name ?? "Contato"}</p><p className="mt-1 text-sm text-[#716963]">{item.service_name_snapshot}</p><p className="mt-1 text-xs text-[#8f4e68]">{dateTime(item.performed_at)}</p></div><p className="font-semibold">{money(item.price_cents ?? 0)}</p></div></article>)}</div> : <p className="mt-6 rounded-2xl bg-[#faf5f7] p-6 text-sm text-[#69344b]">Nenhum atendimento concluído no mês.</p>}</section></>}</div></main>;
}

import { requireActiveMember } from "@lib/auth/session";
import { formatSalonDate, getSalonMonthStart, getSalonToday } from "@lib/dates/salon-calendar";
import Link from "next/link";

import PrintReportButton from "./print-report-button";
import ReportFilters from "./report-filters";

export const metadata = { title: "Relatórios" };
export const instant = false;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function isIsoDate(value: string | undefined): value is string { return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value)); }
function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
function dateTime(value: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
function decimal(value: number) { return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value); }

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const { membership, firebase } = await requireActiveMember();
  const params = await searchParams;
  const today = getSalonToday();
  const defaultStartDate = getSalonMonthStart(today);
  const requestedStartDate = firstParam(params.inicio);
  const requestedEndDate = firstParam(params.fim);
  const startDate = isIsoDate(requestedStartDate) ? requestedStartDate : defaultStartDate;
  const endDate = isIsoDate(requestedEndDate) ? requestedEndDate : today;
  const validRange = startDate <= endDate;
  const reportStartDate = validRange ? startDate : defaultStartDate;
  const reportEndDate = validRange ? endDate : today;
  const professionalId = firstParam(params.profissional) ?? "";
  const { data: professionals } = await firebase.collection("professionals").select("id, name, default_commission_rate").eq("organization_id", membership.organization_id).eq("active", true).order("name");
  const selectedProfessional = professionals?.find((professional) => professional.id === professionalId);
  const parsedPercentage = Number(firstParam(params.percentual) ?? String(selectedProfessional?.default_commission_rate ?? 0));
  const percentage = Number.isFinite(parsedPercentage) ? Math.min(100, Math.max(0, parsedPercentage)) : 0;
  let attendanceQuery = firebase.collection("attendances").select("id, performed_at, service_name_snapshot, price_cents, professional_id, professional_name_snapshot, commission_rate_snapshot, customers(name)").eq("organization_id", membership.organization_id).eq("status", "completed").gte("performed_at", `${reportStartDate}T00:00:00-03:00`).lte("performed_at", `${reportEndDate}T23:59:59-03:00`).order("performed_at", { ascending: false }).limit(500);
  if (professionalId) attendanceQuery = attendanceQuery.eq("professional_id", professionalId);
  const { data: attendances, error } = await attendanceQuery;
  const employeeName = selectedProfessional?.name ?? "";
  const items = attendances ?? [];
  const total = items.reduce((sum, item) => sum + (item.price_cents ?? 0), 0);
  const commission = Math.round(total * percentage / 100);
  const salonTotal = total - commission;

  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10"><div className="mx-auto max-w-6xl" id="report-content"><header className="flex flex-wrap items-end justify-between gap-4"><div><Link className="no-print text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Financeiro</p><h1 className="mt-2 text-3xl font-semibold">Relatórios</h1><p className="mt-2 text-[#716963]">Consulte a arrecadação por período e estime o repasse de um funcionário.</p></div><PrintReportButton /></header>
    <ReportFilters initialStartDate={reportStartDate} initialEndDate={reportEndDate} initialEmployeeName={employeeName} initialProfessionalId={professionalId} professionals={professionals ?? []} initialPercentage={String(percentage)} />
    {!validRange ? <p className="no-print mt-4 rounded-xl border border-[#f0caca] bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">A data inicial não pode ser posterior à data final. Exibindo o período padrão.</p> : null}
    {error ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]">Não foi possível carregar os relatórios.</p> : <><section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><article className="rounded-[2rem] border border-[#e6cbd6] bg-[#faf0f4] p-6"><p className="text-sm font-semibold text-[#8f4e68]">Período</p><p className="mt-3 text-lg font-semibold">{formatSalonDate(reportStartDate)} a {formatSalonDate(reportEndDate)}</p><p className="mt-2 text-sm text-[#716963]">{items.length} atendimento(s)</p></article><article className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6"><p className="text-sm font-semibold text-[#8f4e68]">Arrecadação bruta</p><p className="mt-3 text-2xl font-semibold">{money(total)}</p><p className="mt-2 text-sm text-[#716963]">Atendimentos concluídos</p></article><article className="rounded-[2rem] border border-[#ead7b8] bg-[#f4e7d4] p-6"><p className="text-sm font-semibold text-[#75401f]">Repasse estimado</p><p className="mt-3 text-2xl font-semibold">{money(commission)}</p><p className="mt-2 text-sm text-[#76695c]">{decimal(percentage)}% {employeeName ? `para ${employeeName}` : "aplicado ao período"}</p></article><article className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6"><p className="text-sm font-semibold text-[#8f4e68]">Após repasse</p><p className="mt-3 text-2xl font-semibold">{money(salonTotal)}</p><p className="mt-2 text-sm text-[#716963]">Saldo estimado do salão</p></article></section>
      <p className="mt-5 rounded-2xl bg-[#faf5f7] p-4 text-sm leading-6 text-[#69344b]">O percentual é aplicado sobre a arrecadação dos atendimentos do profissional selecionado. Atendimentos sem profissional continuam no relatório geral.</p>
      <section className="mt-8 rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Detalhamento</p><h2 className="mt-2 text-2xl font-semibold">Atendimentos do período</h2></div><p className="rounded-full bg-[#faf0f4] px-3.5 py-2 text-sm font-semibold text-[#8f4e68]">Total: {money(total)}</p></div>{items.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{items.map((item) => <article className="rounded-2xl border border-[#eee8e3] p-4" key={item.id}><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{item.customers?.[0]?.name ?? "Contato"}</p><p className="mt-1 text-sm text-[#716963]">{item.service_name_snapshot}</p><p className="mt-1 text-xs text-[#8f4e68]">{dateTime(item.performed_at)}</p></div><p className="font-semibold">{money(item.price_cents ?? 0)}</p></div></article>)}</div> : <p className="mt-6 rounded-2xl bg-[#faf5f7] p-6 text-sm text-[#69344b]">Nenhum atendimento concluído no período selecionado.</p>}</section></>}
  </div></main>;
}

import { dismissFollowUpAction,postponeFollowUpAction, recordContactAction } from "@app/retornos/actions";
import FollowUpDateInput from "@app/retornos/follow-up-date-input";
import { formatPhone } from "@domains/contacts/phone";
import { requireActiveMember } from "@lib/auth/session";
import { addCalendarDays, formatSalonDate, getSalonToday } from "@lib/dates/salon-calendar";
import Link from "next/link";

type FollowUpPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };
export const metadata = { title: "Retornos" };
export const instant = false;

function nested<T>(value: T | T[] | null): T | null { return Array.isArray(value) ? value[0] ?? null : value; }

export default async function FollowUpsPage({ searchParams }: FollowUpPageProps) {
  const { membership, supabase } = await requireActiveMember();
  const params = await searchParams;
  const today = getSalonToday();
  const endDate = addCalendarDays(today, 7);
  const [{ data: organization }, { data: followUps, error }] = await Promise.all([
    supabase.from("organizations").select("name, default_message").eq("id", membership.organization_id).single(),
    supabase.from("follow_ups").select("id, original_due_date, next_follow_up_date, status, customers!inner(name, phone_normalized, do_not_contact, status), services(name)").eq("organization_id", membership.organization_id).in("status", ["pending", "postponed"]).lte("next_follow_up_date", endDate).order("next_follow_up_date"),
  ]);
  const visibleFollowUps = (followUps ?? []).filter((item) => { const customer = nested(item.customers); return customer?.status === "active" && !customer.do_not_contact; });
  const todayItems = visibleFollowUps.filter((item) => item.next_follow_up_date <= today);
  const nextItems = visibleFollowUps.filter((item) => item.next_follow_up_date > today);
  const messageTemplate = organization?.default_message ?? "Olá, {{customer_name}}! Aqui é do {{salon_name}}. Podemos combinar um novo atendimento de {{service_name}}?";
  const renderItem = (item: (typeof visibleFollowUps)[number]) => {
    const customer = nested(item.customers);
    const service = nested(item.services);
    if (!customer) return null;
    const message = messageTemplate.replaceAll("{{customer_name}}", customer.name).replaceAll("{{salon_name}}", organization?.name ?? "Salão").replaceAll("{{service_name}}", service?.name ?? "novo atendimento");
    const whatsappUrl = `https://wa.me/${customer.phone_normalized}?text=${encodeURIComponent(message)}`;
    return <article className="rounded-2xl border border-[#eee8e3] p-5" key={item.id}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0"><h3 className="font-semibold">{customer.name}</h3><p className="mt-1 text-sm text-[#716963]">{service?.name ?? "Serviço"} · {formatPhone(customer.phone_normalized)}</p><p className="mt-2 text-sm text-[#716963]">Previsto para {formatSalonDate(item.original_due_date)}{item.status === "postponed" ? ` · acompanhamento em ${formatSalonDate(item.next_follow_up_date)}` : ""}</p></div>
        <a className="whatsapp-button inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-[#25d366] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1da851] sm:w-auto" href={whatsappUrl} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
      </div>
      <div className="mt-5 grid gap-3 border-t border-[#f1ece8] pt-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <form action={recordContactAction}><input type="hidden" name="followUpId" value={item.id} /><button className="w-full rounded-xl bg-[#8f4e68] px-4 py-3 text-sm font-semibold text-white hover:bg-[#69344b]" type="submit">Já chamei</button></form>
        <form action={postponeFollowUpAction} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><input type="hidden" name="followUpId" value={item.id} /><FollowUpDateInput name="nextDate" defaultValue={item.next_follow_up_date} /><button className="rounded-xl border border-[#d9cec8] px-4 py-3 text-sm font-semibold hover:border-[#8f4e68]" type="submit">Adiar</button></form>
        <form action={dismissFollowUpAction}><input type="hidden" name="followUpId" value={item.id} /><button className="w-full rounded-xl border border-[#d9cec8] px-4 py-3 text-sm font-semibold text-[#716963] hover:border-[#8f4e68] hover:text-[#8f4e68]" type="submit">Dispensar</button></form>
      </div>
    </article>;
  };

  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-center justify-between gap-4"><div><Link className="text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><h1 className="mt-3 text-3xl font-semibold">Retornos</h1><p className="mt-2 text-[#716963]">Acompanhe quem precisa de um novo contato.</p></div></header>{params.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{params.erro}</p> : null}{params.resultado ? <p className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">Ação registrada com sucesso.</p> : null}{error ? <p className="mt-8 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]">Não foi possível carregar os retornos.</p> : <div className="mt-8 grid gap-8 lg:grid-cols-2"><section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Para chamar hoje</h2><p className="mt-2 text-sm text-[#716963]">{todayItems.length} retorno(s)</p></div></div><div className="mt-6 space-y-3">{todayItems.length ? todayItems.map(renderItem) : <div className="rounded-2xl bg-[#faf5f7] p-6 text-sm leading-6 text-[#69344b]">Nenhum retorno pendente para hoje.</div>}</div></section><section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Próximos sete dias</h2><p className="mt-2 text-sm text-[#716963]">{nextItems.length} retorno(s)</p></div></div><div className="mt-6 space-y-3">{nextItems.length ? nextItems.map(renderItem) : <div className="rounded-2xl bg-[#f8f7f4] p-6 text-sm leading-6 text-[#716963]">Nenhum próximo retorno pendente.</div>}</div></section></div>}</div></main>;
}

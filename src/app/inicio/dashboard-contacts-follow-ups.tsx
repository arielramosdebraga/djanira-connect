import Link from "next/link";
import { formatPhone } from "@/domains/contacts/phone";
import { formatSalonDate } from "@/lib/dates/salon-calendar";

type ContactSummary = { id: string; name: string; phone_normalized: string };
type FollowUpSummary = {
  id: string;
  next_follow_up_date: string;
  status: string;
  customers: { name: string; phone_normalized: string; do_not_contact: boolean; status: string } | Array<{ name: string; phone_normalized: string; do_not_contact: boolean; status: string }> | null;
  services: { name: string } | Array<{ name: string }> | null;
};

function first<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default function DashboardContactsFollowUps({ contacts, followUps }: { contacts: ContactSummary[]; followUps: FollowUpSummary[] }) {
  const visibleFollowUps = followUps.filter((item) => {
    const customer = first(item.customers);
    return customer?.status === "active" && !customer.do_not_contact;
  });

  return <section className="mt-8 grid gap-4 lg:grid-cols-2">
    <div className="rounded-[2rem] border border-[#e8e1dc] bg-white p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Contatos</p><h2 className="mt-2 text-2xl font-semibold">Clientes recentes</h2><p className="mt-1 text-sm text-[#716963]">Acesse rapidamente os contatos ativos.</p></div><Link className="text-sm font-semibold text-[#8f4e68] hover:underline" href="/contatos">Ver todos</Link></div>
      <div className="mt-6 space-y-2">{contacts.length ? contacts.slice(0, 5).map((contact) => <Link className="flex items-center justify-between gap-3 rounded-xl border border-[#eee8e3] px-4 py-3 transition hover:border-[#d9b9c7] hover:bg-[#fcfbfa]" href={`/contatos/${contact.id}`} key={contact.id}><span className="min-w-0"><span className="block truncate font-semibold">{contact.name}</span><span className="mt-1 block text-sm text-[#716963]">{formatPhone(contact.phone_normalized)}</span></span><span className="text-[#8f4e68]">→</span></Link>) : <p className="rounded-xl bg-[#faf5f7] p-4 text-sm text-[#69344b]">Nenhum contato ativo cadastrado.</p>}</div>
    </div>
    <div className="rounded-[2rem] border border-[#e8e1dc] bg-white p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Retornos</p><h2 className="mt-2 text-2xl font-semibold">Próximos contatos</h2><p className="mt-1 text-sm text-[#716963]">Pessoas que precisam de acompanhamento.</p></div><Link className="text-sm font-semibold text-[#8f4e68] hover:underline" href="/retornos">Ver retornos</Link></div>
      <div className="mt-6 space-y-2">{visibleFollowUps.length ? visibleFollowUps.slice(0, 5).map((item) => { const customer = first(item.customers); const service = first(item.services); if (!customer) return null; return <Link className="flex items-center justify-between gap-3 rounded-xl border border-[#eee8e3] px-4 py-3 transition hover:border-[#d9b9c7] hover:bg-[#fcfbfa]" href="/retornos" key={item.id}><span className="min-w-0"><span className="block truncate font-semibold">{customer.name}</span><span className="mt-1 block truncate text-sm text-[#716963]">{service?.name ?? "Serviço"} · {formatPhone(customer.phone_normalized)}</span></span><span className="shrink-0 text-right text-xs font-semibold text-[#8f4e68]">{formatSalonDate(item.next_follow_up_date)}</span></Link>; }) : <p className="rounded-xl bg-[#f8f7f4] p-4 text-sm text-[#716963]">Nenhum retorno pendente nos próximos dias.</p>}</div>
    </div>
  </section>;
}

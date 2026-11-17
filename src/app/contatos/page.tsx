import Link from "next/link";
import { createContactAction } from "@/app/contatos/actions";
import ContactList from "@/app/contatos/contact-list";
import ContactModal from "@/app/contatos/contact-modal";
import { requireActiveMember } from "@/lib/auth/session";

type ContactsPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };
export const metadata = { title: "Contatos" };
export const instant = false;

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { membership, supabase } = await requireActiveMember();
  const params = await searchParams;
  const [{ data: contacts, error }, { data: services }, { data: attendanceRows }, { data: followUpRows }] = await Promise.all([
    supabase.from("customers").select("id, name, phone_normalized, notes, do_not_contact, status, last_contact_at").eq("organization_id", membership.organization_id).eq("status", "active").order("name").limit(100),
    supabase.from("services").select("id, name").eq("organization_id", membership.organization_id).order("name"),
    supabase.from("attendances").select("customer_id, service_id").eq("organization_id", membership.organization_id).eq("status", "completed"),
    supabase.from("follow_ups").select("customer_id, status").eq("organization_id", membership.organization_id),
  ]);
  const contactsWithFilters = (contacts ?? []).map((contact) => ({ ...contact, serviceIds: (attendanceRows ?? []).filter((row) => row.customer_id === contact.id).map((row) => row.service_id), followUpStatuses: (followUpRows ?? []).filter((row) => row.customer_id === contact.id).map((row) => row.status) }));
  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-end justify-between gap-4"><div><Link className="text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><h1 className="mt-3 text-3xl font-semibold">Contatos</h1><p className="mt-2 text-[#716963]">Cadastre clientes e encontre rapidamente quem você precisa atender.</p></div><ContactModal action={createContactAction} /></header>{params.erro ? <p className="mt-6 rounded-xl border border-[#f0caca] bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{params.erro}</p> : null}{params.resultado ? <p className="mt-6 rounded-xl border border-[#cce8d3] bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">Contato cadastrado com sucesso.</p> : null}{error ? <p className="mt-8 rounded-xl border border-[#f0caca] bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]">Não foi possível carregar os contatos.</p> : <div className="mt-8"><ContactList contacts={contactsWithFilters} services={services ?? []} /></div>}</div></main>;
}

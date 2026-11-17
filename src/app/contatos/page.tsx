import Link from "next/link";
import { createContactAction } from "@/app/contatos/actions";
import { formatPhone } from "@/domains/contacts/phone";
import { requireActiveMember } from "@/lib/auth/session";

type ContactsPageProps = { searchParams: Promise<{ erro?: string; resultado?: string; busca?: string }> };

export const metadata = { title: "Contatos" };

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { membership, supabase } = await requireActiveMember();
  const params = await searchParams;
  const search = (params.busca ?? "").trim().replace(/[%,()]/g, "");
  let query = supabase.from("customers").select("id, name, phone_normalized, notes, do_not_contact, status, last_contact_at").eq("organization_id", membership.organization_id).eq("status", "active").order("name").limit(50);
  if (search) query = query.or(`name.ilike.%${search}%,phone_normalized.ilike.%${search}%`);
  const { data: contacts, error } = await query;

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10"><div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4"><div><Link className="text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><h1 className="mt-3 text-3xl font-semibold">Contatos</h1><p className="mt-2 text-[#716963]">Cadastre clientes e encontre rapidamente quem você precisa atender.</p></div><Link className="rounded-full border border-[#d9cec8] px-5 py-2.5 text-sm font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/auth/logout">Sair</Link></header>
      {params.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{params.erro}</p> : null}{params.resultado ? <p className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">Contato cadastrado com sucesso.</p> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Novo contato</h2><form className="mt-6 space-y-4" action={createContactAction}><label className="block text-sm font-medium">Nome<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="name" required /></label><label className="block text-sm font-medium">Telefone ou WhatsApp<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="phone" inputMode="tel" placeholder="(11) 99999-9999" required /></label><label className="block text-sm font-medium">Observações<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="notes" maxLength={500} /></label><label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1 size-4 accent-[#8f4e68]" name="doNotContact" type="checkbox" />Não realizar contatos de retorno</label><button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b]" type="submit">Cadastrar contato</button></form></section>
      <section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Lista de contatos</h2><p className="mt-2 text-sm text-[#716963]">{contacts?.length ?? 0} contato(s) encontrado(s)</p></div><form className="flex w-full gap-2 sm:w-auto" method="get"><input className="min-w-0 flex-1 rounded-xl border border-[#d9cec8] px-4 py-2.5 text-sm focus:border-[#8f4e68] focus:outline-none sm:w-56" name="busca" defaultValue={params.busca} placeholder="Buscar nome ou telefone" /><button className="rounded-xl border border-[#d9cec8] px-4 py-2.5 text-sm font-semibold hover:border-[#8f4e68]" type="submit">Buscar</button></form></div>{error ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]">Não foi possível carregar os contatos.</p> : contacts?.length ? <div className="mt-6 space-y-3">{contacts.map((contact) => <article className="rounded-2xl border border-[#eee8e3] p-4" key={contact.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-semibold">{contact.name}</h3><p className="mt-1 text-sm text-[#716963]">{formatPhone(contact.phone_normalized)}</p>{contact.notes ? <p className="mt-2 text-sm leading-6 text-[#716963]">{contact.notes}</p> : null}</div>{contact.do_not_contact ? <span className="rounded-full bg-[#f1eeeb] px-2.5 py-1 text-xs font-semibold text-[#716963]">Sem contato</span> : null}</div></article>)}</div> : <div className="mt-6 rounded-2xl bg-[#faf5f7] p-6 text-sm leading-6 text-[#69344b]">Nenhum contato cadastrado ainda.</div>}</section></div>
    </div></main>
  );
}

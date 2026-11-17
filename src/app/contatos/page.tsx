import Link from "next/link";
import { createContactAction } from "@/app/contatos/actions";
import PhoneInput from "@/components/forms/phone-input";
import ContactList from "@/app/contatos/contact-list";
import { requireActiveMember } from "@/lib/auth/session";

type ContactsPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };

export const metadata = { title: "Contatos" };
export const instant = false;

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { membership, supabase } = await requireActiveMember();
  const params = await searchParams;
  const { data: contacts, error } = await supabase.from("customers").select("id, name, phone_normalized, notes, do_not_contact, status, last_contact_at").eq("organization_id", membership.organization_id).eq("status", "active").order("name").limit(100);

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10"><div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4"><div><Link className="text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><h1 className="mt-3 text-3xl font-semibold">Contatos</h1><p className="mt-2 text-[#716963]">Cadastre clientes e encontre rapidamente quem você precisa atender.</p></div><Link className="rounded-full border border-[#d9cec8] px-5 py-2.5 text-sm font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/auth/logout">Sair</Link></header>
      {params.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{params.erro}</p> : null}{params.resultado ? <p className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">Contato cadastrado com sucesso.</p> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">Novo contato</h2><form className="mt-6 space-y-4" action={createContactAction}><label className="block text-sm font-medium">Nome<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="name" required /></label><label className="block text-sm font-medium">Telefone ou WhatsApp<PhoneInput name="phone" required /></label><label className="block text-sm font-medium">Observações<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="notes" maxLength={500} /></label><label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1 size-4 accent-[#8f4e68]" name="doNotContact" type="checkbox" />Não realizar contatos de retorno</label><button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b]" type="submit">Cadastrar contato</button></form></section>{error ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]">Não foi possível carregar os contatos.</p> : <ContactList contacts={contacts ?? []} />}</div>
    </div></main>
  );
}

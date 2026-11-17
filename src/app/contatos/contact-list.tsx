"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPhone } from "@/domains/contacts/phone";

type Contact = { id: string; name: string; phone_normalized: string; notes: string | null; do_not_contact: boolean };

export default function ContactList({ contacts }: { contacts: Contact[] }) {
  const [search, setSearch] = useState("");
  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase().replace(/\D/g, "");
    const textSearch = search.trim().toLowerCase();
    if (!textSearch) return contacts;
    return contacts.filter((contact) => contact.name.toLowerCase().includes(textSearch) || (normalizedSearch.length > 0 && contact.phone_normalized.includes(normalizedSearch)));
  }, [contacts, search]);

  return <section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Lista de contatos</h2><p className="mt-2 text-sm text-[#716963]">{filteredContacts.length} contato(s) encontrado(s)</p></div><input className="min-w-0 flex-1 rounded-xl border border-[#d9cec8] px-4 py-2.5 text-sm focus:border-[#8f4e68] focus:outline-none sm:w-56 sm:flex-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome ou telefone" aria-label="Buscar contatos por nome ou telefone" /></div>{filteredContacts.length ? <div className="mt-6 space-y-3">{filteredContacts.map((contact) => <article className="rounded-2xl border border-[#eee8e3] p-4" key={contact.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-semibold"><Link className="hover:text-[#8f4e68]" href={`/contatos/${contact.id}`}>{contact.name}</Link></h3><p className="mt-1 text-sm text-[#716963]">{formatPhone(contact.phone_normalized)}</p>{contact.notes ? <p className="mt-2 text-sm leading-6 text-[#716963]">{contact.notes}</p> : null}</div>{contact.do_not_contact ? <span className="rounded-full bg-[#f1eeeb] px-2.5 py-1 text-xs font-semibold text-[#716963]">Sem contato</span> : null}</div></article>)}</div> : <div className="mt-6 rounded-2xl bg-[#faf5f7] p-6 text-sm leading-6 text-[#69344b]">Nenhum contato encontrado.</div>}</section>;
}

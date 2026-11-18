"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPhone } from "@/domains/contacts/phone";
import SearchableSelect from "@/components/forms/searchable-select";
import PaginationControls from "@/components/pagination-controls";

type Contact = { id: string; name: string; phone_normalized: string; notes: string | null; do_not_contact: boolean; last_contact_at: string | null; serviceIds: string[]; followUpStatuses: string[] };
type Service = { id: string; name: string };
type ReturnFilter = "all" | "pending" | "contacted" | "none";
type ContactAgeFilter = "all" | "never" | "30" | "60" | "90";

function formatLastContact(value: string | null) {
  if (!value) return "Nunca contatado";
  return `Último contato: ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value))}`;
}

export default function ContactList({ contacts, services }: { contacts: Contact[]; services: Service[] }) {
  const [search, setSearch] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [returnFilter, setReturnFilter] = useState<ReturnFilter>("all");
  const [contactAgeFilter, setContactAgeFilter] = useState<ContactAgeFilter>("all");
  const [now, setNow] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setPage(1), 0);
    return () => window.clearTimeout(timer);
  }, [contactAgeFilter, returnFilter, search, serviceId]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase().replace(/\D/g, "");
    const textSearch = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesSearch = !textSearch || contact.name.toLowerCase().includes(textSearch) || (normalizedSearch.length > 0 && contact.phone_normalized.includes(normalizedSearch));
      const matchesService = !serviceId || contact.serviceIds.includes(serviceId);
      const matchesReturn = returnFilter === "all" || (returnFilter === "none" && !contact.followUpStatuses.some((status) => ["pending", "postponed", "contacted"].includes(status))) || (returnFilter === "pending" && contact.followUpStatuses.some((status) => ["pending", "postponed"].includes(status))) || (returnFilter === "contacted" && contact.followUpStatuses.includes("contacted"));
      const matchesAge = contactAgeFilter === "all" || (contactAgeFilter === "never" && !contact.last_contact_at) || (now !== null && Boolean(contact.last_contact_at) && now - new Date(contact.last_contact_at as string).getTime() >= Number(contactAgeFilter) * 24 * 60 * 60 * 1000);
      return matchesSearch && matchesService && matchesReturn && matchesAge;
    });
  }, [contacts, contactAgeFilter, now, returnFilter, search, serviceId]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
  const visibleContacts = filteredContacts.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = Boolean(search || serviceId || returnFilter !== "all" || contactAgeFilter !== "all");
  const clearFilters = () => { setSearch(""); setServiceId(""); setReturnFilter("all"); setContactAgeFilter("all"); };
  const filterButton = (value: ReturnFilter, label: string) => <button className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${returnFilter === value ? "bg-[#8f4e68] text-white" : "border border-[#d9cec8] bg-white text-[#716963] hover:border-[#8f4e68] hover:text-[#8f4e68]"}`} type="button" onClick={() => setReturnFilter(value)}>{label}</button>;
  const ageButton = (value: ContactAgeFilter, label: string) => <button className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${contactAgeFilter === value ? "bg-[#8f4e68] text-white" : "border border-[#d9cec8] bg-white text-[#716963] hover:border-[#8f4e68] hover:text-[#8f4e68]"}`} type="button" onClick={() => setContactAgeFilter(value)}>{label}</button>;

  return <section className="rounded-[2rem] border border-[#e8e1dc] bg-white p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Base de clientes</p><h2 className="mt-2 text-2xl font-semibold">Encontre um contato</h2><p className="mt-1 text-sm text-[#716963]">Busque por nome ou telefone e use os filtros para priorizar sua rotina.</p></div><p className="rounded-full bg-[#faf0f4] px-3.5 py-2 text-sm font-semibold text-[#8f4e68]">{filteredContacts.length} resultado(s)</p></div><div className="mt-6 grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto]"><label className="relative block"><span className="sr-only">Buscar contato</span><input className="mt-2 w-full rounded-xl border border-[#d9cec8] bg-[#fcfbfa] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:bg-white" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite nome ou telefone..." aria-label="Buscar contatos por nome ou telefone" /></label><SearchableSelect name="contactServiceFilter" placeholder="Todos os serviços" options={[{ value: "", label: "Todos os serviços" }, ...services.map((service) => ({ value: service.id, label: service.name }))]} onValueChange={setServiceId} /><button className="mt-2 rounded-xl border border-[#d9cec8] px-4 py-3.5 text-sm font-semibold text-[#716963] hover:border-[#8f4e68] hover:text-[#8f4e68] disabled:cursor-default disabled:opacity-50" type="button" onClick={clearFilters} disabled={!hasFilters}>Limpar filtros</button></div><div className="mt-5 space-y-3"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#a09892]">Retorno</p><div className="flex flex-wrap gap-2">{filterButton("all", "Todos")}{filterButton("pending", "Pendente")}{filterButton("contacted", "Já contatados")}{filterButton("none", "Sem retorno")}</div></div><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#a09892]">Tempo sem contato</p><div className="flex flex-wrap gap-2">{ageButton("all", "Todos")}{ageButton("never", "Nunca contatados")}{ageButton("30", "30+ dias")}{ageButton("60", "60+ dias")}{ageButton("90", "90+ dias")}</div></div></div>{visibleContacts.length ? <div className="mt-7 grid gap-3 md:grid-cols-2">{visibleContacts.map((contact) => <article className="group rounded-2xl border border-[#eee8e3] p-4 transition hover:border-[#d9b9c7] hover:shadow-[0_8px_30px_rgba(91,55,37,0.06)]" key={contact.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-semibold text-[#29231f]"><Link className="hover:text-[#8f4e68]" href={`/contatos/${contact.id}`}>{contact.name}</Link></h3><p className="mt-1 text-sm text-[#716963]">{formatPhone(contact.phone_normalized)}</p></div>{contact.do_not_contact ? <span className="shrink-0 rounded-full bg-[#f1eeeb] px-2.5 py-1 text-[11px] font-semibold text-[#716963]">Sem contato</span> : null}</div><div className="mt-4 flex items-center justify-between gap-3 border-t border-[#f1ece8] pt-3"><p className="text-xs text-[#8f4e68]">{formatLastContact(contact.last_contact_at)}</p><Link className="text-xs font-semibold text-[#8f4e68] opacity-0 transition group-hover:opacity-100 focus:opacity-100" href={`/contatos/${contact.id}`}>Ver ficha →</Link></div>{contact.notes ? <p className="mt-3 line-clamp-2 text-sm leading-5 text-[#716963]">{contact.notes}</p> : null}</article>)}</div> : <div className="mt-7 rounded-2xl border border-dashed border-[#d9cec8] bg-[#fcfbfa] p-8 text-center"><p className="font-semibold text-[#69344b]">Nenhum contato encontrado</p><p className="mt-1 text-sm text-[#716963]">Tente ajustar a busca ou remover algum filtro.</p>{hasFilters ? <button className="mt-4 rounded-xl bg-[#8f4e68] px-4 py-2.5 text-sm font-semibold text-white" type="button" onClick={clearFilters}>Limpar filtros</button> : null}</div>}<PaginationControls page={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} /></section>;
}

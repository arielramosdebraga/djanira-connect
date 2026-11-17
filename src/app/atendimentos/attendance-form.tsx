"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import SearchableSelect from "@/components/forms/searchable-select";
import { formatPhone } from "@/domains/contacts/phone";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b] disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">{pending ? "Salvando..." : "Registrar atendimento"}</button>;
}

export default function AttendanceForm({ action, customers, services }: { action: (formData: FormData) => void | Promise<void>; customers: Array<{ id: string; name: string; phone_normalized: string }>; services: Array<{ id: string; name: string; average_price_cents: number | null }> }) {
  const [idempotencyKey, setIdempotencyKey] = useState("");
  useEffect(() => { setIdempotencyKey(crypto.randomUUID()); }, []);
  return <form className="mt-6 space-y-4" action={action}><input type="hidden" name="idempotencyKey" value={idempotencyKey} /><label className="block text-sm font-medium">Contato<SearchableSelect name="customerId" placeholder="Pesquise por nome ou telefone" required options={customers.map((customer) => ({ value: customer.id, label: `${customer.name} — ${formatPhone(customer.phone_normalized)}` }))} /></label><label className="block text-sm font-medium">Serviço<SearchableSelect name="serviceId" placeholder="Pesquise por serviço" required options={services.map((service) => ({ value: service.id, label: service.name }))} /></label><label className="block text-sm font-medium">Data e horário<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="performedAt" type="datetime-local" required /></label><label className="block text-sm font-medium">Valor praticado<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="price" inputMode="decimal" placeholder="Opcional" /></label><label className="block text-sm font-medium">Observações<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="notes" maxLength={500} /></label><SubmitButton /></form>;
}

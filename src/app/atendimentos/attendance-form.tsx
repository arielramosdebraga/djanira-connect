"use client";

import { useEffect, useState } from "react";
import CurrencyInput from "@/components/forms/currency-input";
import DateTimeFields from "@/components/forms/date-time-fields";
import SearchableSelect from "@/components/forms/searchable-select";
import { formatPhone } from "@/domains/contacts/phone";

type AttendanceFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  customers: Array<{ id: string; name: string; phone_normalized: string }>;
  services: Array<{ id: string; name: string; average_price_cents: number | null }>;
  professionals?: Array<{ id: string; name: string; default_commission_rate: number }>;
  attendanceId?: string;
  initialCustomerId?: string;
  initialServiceId?: string;
  initialProfessionalId?: string;
  initialDate?: string;
  initialTime?: string;
  initialPriceCents?: number | null;
  initialNotes?: string;
  submitLabel?: string;
};

export default function AttendanceForm({ action, customers, services, professionals = [], attendanceId, initialCustomerId = "", initialServiceId = "", initialProfessionalId = "", initialDate = "", initialTime = "", initialPriceCents = null, initialNotes = "", submitLabel = "Registrar atendimento" }: AttendanceFormProps) {
  const [idempotencyKey, setIdempotencyKey] = useState("");
  useEffect(() => { setIdempotencyKey(crypto.randomUUID()); }, []);

  return <form className="pt-6 space-y-4" action={action}>
    <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
    {attendanceId ? <input type="hidden" name="attendanceId" value={attendanceId} /> : null}
    <label className="block text-sm font-medium">
      <span className="block">Contato</span>
      <SearchableSelect name="customerId" placeholder="Pesquise por nome ou telefone" required defaultValue={initialCustomerId} options={customers.map((customer) => ({ value: customer.id, label: `${customer.name} — ${formatPhone(customer.phone_normalized)}` }))} />
    </label>
    <label className="block text-sm font-medium">
      <span className="block">Serviço</span>
      <SearchableSelect name="serviceId" placeholder="Pesquise por serviço" required defaultValue={initialServiceId} options={services.map((service) => ({ value: service.id, label: service.name }))} />
    </label>
    <label className="block text-sm font-medium">
      <span className="block">Profissional responsável</span>
      <SearchableSelect name="professionalId" placeholder="Selecione, se aplicável" defaultValue={initialProfessionalId} options={professionals.map((professional) => ({ value: professional.id, label: professional.name }))} />
      <span className="mt-1 block text-xs font-normal text-[#716963]">Opcional para atendimentos antigos ou sem comissão.</span>
    </label>
    <DateTimeFields name="performedAt" initialDate={initialDate} initialTime={initialTime} />
    <label className="block text-sm font-medium">Valor praticado<CurrencyInput name="price" defaultValue={initialPriceCents === null ? "" : String(initialPriceCents)} /></label>
    <label className="block text-sm font-medium">Observações<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="notes" maxLength={500} defaultValue={initialNotes} /></label>
    <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b] disabled:opacity-60" type="submit">{submitLabel}</button>
  </form>;
}

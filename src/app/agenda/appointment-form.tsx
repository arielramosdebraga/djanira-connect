"use client";

import MaskedDateInput from "@components/forms/masked-date-input";
import SearchableSelect from "@components/forms/searchable-select";
import { formatPhone } from "@domains/contacts/phone";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b] disabled:opacity-60" disabled={pending} type="submit">{pending ? "Salvando..." : "Agendar compromisso"}</button>;
}

type AppointmentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  customers: Array<{ id: string; name: string; phone_normalized: string }>;
  services: Array<{ id: string; name: string }>;
  returnTo?: "/agenda" | "/inicio";
};

export default function AppointmentForm({ action, customers, services, returnTo = "/agenda" }: AppointmentFormProps) {
  const idempotencyInput = useRef<HTMLInputElement>(null);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const timeOptions = Array.from({ length: 41 }, (_, index) => {
    const hours = String(8 + Math.floor(index / 4)).padStart(2, "0");
    const minutes = String((index % 4) * 15).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  return (
    <form className="mt-6 space-y-4" action={action} onSubmit={() => { if (idempotencyInput.current && !idempotencyInput.current.value) idempotencyInput.current.value = crypto.randomUUID(); }}>
      <input ref={idempotencyInput} type="hidden" name="idempotencyKey" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="block text-sm font-medium">
        Cliente
        <SearchableSelect
          name="customerId"
          placeholder="Pesquise por nome ou telefone"
          required
          options={customers.map((customer) => ({ value: customer.id, label: `${customer.name} — ${formatPhone(customer.phone_normalized)}` }))}
        />
        <span className="mt-2 block text-xs font-normal text-[#716963]">Digite o nome ou o número para encontrar o cliente.</span>
      </label>
      <label className="block text-sm font-medium">Serviço<SearchableSelect name="serviceId" placeholder="Pesquise por serviço" required options={services.map((service) => ({ value: service.id, label: service.name }))} /></label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Data desejada
          <MaskedDateInput value={reservationDate} onChange={setReservationDate} required />
        </label>

        <label className="block text-sm font-medium">
          Horário (24h)
          <SearchableSelect name="appointmentTime" placeholder="Pesquise ou selecione o horário" required options={timeOptions.map((time) => ({ value: time, label: time }))} onValueChange={setReservationTime} />
        </label>
      </div>
      <span className="-mt-2 block text-xs font-normal text-[#716963]">A data abre o calendário ao focar. O horário usa o padrão de 24 horas.</span>
      <input type="hidden" name="startsAt" value={reservationDate && reservationTime ? `${reservationDate}T${reservationTime}` : ""} />
      <label className="block text-sm font-medium">Observações<textarea className="mt-2 min-h-20 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="notes" maxLength={500} /></label>
      <SubmitButton />
    </form>
  );
}

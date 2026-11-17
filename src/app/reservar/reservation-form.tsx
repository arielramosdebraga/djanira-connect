"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import SearchableSelect from "@/components/forms/searchable-select";
import MaskedDateInput from "@/components/forms/masked-date-input";
import { createClient } from "@/lib/supabase/browser";

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  if (!number) return `(${areaCode}`;
  if (number.length <= 4) return `(${areaCode}) ${number}`;
  if (digits.length <= 10) return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`;
  return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b] disabled:opacity-60" disabled={pending} type="submit">
      {pending ? "Enviando..." : "Solicitar reserva"}
    </button>
  );
}

type ReservationFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  services: Array<{ service_id: string; service_name: string; duration_minutes: number }>;
};

export default function ReservationForm({ action, services }: ReservationFormProps) {
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [phone, setPhone] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  useEffect(() => {
    setReservationTime("");
    if (!serviceId || !reservationDate) {
      setAvailableTimes([]);
      return;
    }
    let cancelled = false;
    setLoadingTimes(true);
    createClient().rpc("get_public_reservation_slots", { p_service_id: serviceId, p_date: reservationDate }).then(({ data, error }) => {
      if (cancelled) return;
      setAvailableTimes(error ? [] : (data ?? []).map((slot: { slot_time: string }) => slot.slot_time.slice(0, 5)));
      setLoadingTimes(false);
    });
    return () => { cancelled = true; };
  }, [reservationDate, serviceId]);

  const startsAt = reservationDate && reservationTime ? `${reservationDate}T${reservationTime}` : "";

  return (
    <form className="mt-8 space-y-5" action={action}>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="startsAt" value={startsAt} />

      <label className="block text-sm font-medium">
        Serviço
        <SearchableSelect
          name="serviceId"
          placeholder="Pesquise por serviço"
          required
          onValueChange={setServiceId}
          options={services.map((service) => ({ value: service.service_id, label: `${service.service_name} · ${service.duration_minutes} min` }))}
        />
      </label>

      <label className="block text-sm font-medium">
        Nome
        <input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="name" required />
      </label>

      <label className="block text-sm font-medium">
        Telefone ou WhatsApp
        <input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="phone" inputMode="tel" maxLength={15} placeholder="(11) 99999-9999" required value={phone} onChange={(event) => setPhone(formatPhoneInput(event.target.value))} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Data desejada
          <MaskedDateInput value={reservationDate} onChange={setReservationDate} required />
        </label>

        <label className="block text-sm font-medium">
          Horário (24h)
          {loadingTimes ? <p className="mt-2 rounded-xl bg-[#faf5f7] px-4 py-3 text-sm text-[#716963]">Buscando horários livres...</p> : availableTimes.length ? <SearchableSelect key={`${serviceId}-${reservationDate}`} name="reservationTime" placeholder="Pesquise ou selecione o horário" required options={availableTimes.map((time) => ({ value: time, label: time }))} onValueChange={setReservationTime} /> : <p className="mt-2 rounded-xl bg-[#faf5f7] px-4 py-3 text-sm text-[#69344b]">Selecione o serviço e a data para ver horários livres.</p>}
        </label>
      </div>

      <span className="-mt-2 block text-xs font-normal text-[#716963]">Os horários ocupados e dias sem expediente não aparecem na lista.</span>

      <SubmitButton />
    </form>
  );
}

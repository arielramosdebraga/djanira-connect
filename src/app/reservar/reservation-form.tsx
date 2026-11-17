"use client";

import { type FormEvent, useEffect, useState } from "react";
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
  const [slotsError, setSlotsError] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  useEffect(() => {
    setReservationTime("");
    if (!serviceId || !reservationDate) {
      setAvailableTimes([]);
      setSlotsError(false);
      return;
    }
    let cancelled = false;
    setLoadingTimes(true);
    setSlotsError(false);
    createClient().rpc("get_public_reservation_slots", { p_service_id: serviceId, p_date: reservationDate }).then(({ data, error }) => {
      if (cancelled) return;
      setSlotsError(Boolean(error));
      setAvailableTimes(error ? [] : (data ?? []).map((slot: { slot_time: string }) => slot.slot_time.slice(0, 5)));
      setLoadingTimes(false);
    });
    return () => { cancelled = true; };
  }, [reservationDate, serviceId]);

  const startsAt = reservationDate && reservationTime ? `${reservationDate}T${reservationTime}` : "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!serviceId || !reservationDate || !reservationTime) {
      event.preventDefault();
      setFormError(!reservationDate ? "Informe a data desejada." : "Selecione um horário disponível.");
      return;
    }
    setFormError("");
  };

  return (
    <form className="mt-8 space-y-5" action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="startsAt" value={startsAt} />
      {formError ? <p className="rounded-xl border border-[#f0caca] bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{formError}</p> : null}

      <label className="block text-sm font-medium">
        Serviço
        <SearchableSelect
          name="serviceId"
          placeholder="Pesquise por serviço"
          required
          onValueChange={(value) => { setServiceId(value); setFormError(""); }}
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
          <div className="mt-2"><MaskedDateInput value={reservationDate} onChange={(value) => { setReservationDate(value); setFormError(""); }} required /></div>
        </label>

        <label className="block text-sm font-medium">
          Horário (24h)
          {loadingTimes ? <p className="mt-2 rounded-xl bg-[#faf5f7] px-4 py-3 text-sm text-[#716963]">Buscando horários livres...</p> : slotsError ? <div className="mt-2 rounded-xl border border-[#f0caca] bg-[#fff1f1] px-4 py-3 text-sm text-[#9b3e3e]"><p className="font-semibold">Não foi possível consultar os horários.</p><p className="mt-1">Tente selecionar a data novamente.</p></div> : availableTimes.length ? <SearchableSelect key={`${serviceId}-${reservationDate}`} name="reservationTime" placeholder="Ex.: 09:00" required options={availableTimes.map((time) => ({ value: time, label: time }))} onValueChange={(value) => { setReservationTime(value); setFormError(""); }} /> : serviceId && reservationDate ? <div className="mt-2 rounded-xl border border-[#ead9df] bg-[#faf5f7] px-4 py-3 text-sm text-[#69344b]"><p className="font-semibold">Nenhum horário disponível</p><p className="mt-1">Escolha outra data para encontrar um horário livre.</p></div> : <p className="mt-2 rounded-xl bg-[#faf5f7] px-4 py-3 text-sm text-[#69344b]">Selecione o serviço e a data para ver horários livres.</p>}
        </label>
      </div>

      <span className="-mt-2 block text-xs font-normal text-[#716963]">Os horários ocupados e dias sem expediente não aparecem na lista.</span>

      <SubmitButton />
    </form>
  );
}

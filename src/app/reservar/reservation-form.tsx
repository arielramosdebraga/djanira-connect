"use client";

import MaskedDateInput from "@components/forms/masked-date-input";
import SearchableSelect from "@components/forms/searchable-select";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

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

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${minutes} min`;
  if (!remainingMinutes) return `${hours} ${hours === 1 ? "hora" : "horas"}`;
  return `${hours} ${hours === 1 ? "hora" : "horas"} ${remainingMinutes} min`;
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
  initialServiceId?: string;
  returnTo?: string;
};

export default function ReservationForm({ action, services, initialServiceId = "", returnTo = "/reservar" }: ReservationFormProps) {
  const idempotencyInput = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [formError, setFormError] = useState("");
  const selectedService = services.find((service) => service.service_id === serviceId);

  useEffect(() => {
    if (!serviceId || !reservationDate) {
      const timer = window.setTimeout(() => { setAvailableTimes([]); setSlotsError(false); setLoadingTimes(false); }, 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoadingTimes(true);
      setSlotsError(false);
      fetch(`/api/public/reservations?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(reservationDate)}`, { cache: "no-store" }).then(async (response) => {
        const result = await response.json() as { slots?: Array<{ slot_time: string }>; error?: string };
        if (cancelled) return;
        setSlotsError(!response.ok);
        setAvailableTimes(response.ok ? (result.slots ?? []).map((slot) => slot.slot_time.slice(0, 5)) : []);
        setLoadingTimes(false);
      }).catch(() => {
        if (cancelled) return;
        setSlotsError(true);
        setAvailableTimes([]);
        setLoadingTimes(false);
      });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [reservationDate, serviceId]);

  const startsAt = reservationDate && reservationTime ? `${reservationDate}T${reservationTime}` : "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (idempotencyInput.current && !idempotencyInput.current.value) idempotencyInput.current.value = crypto.randomUUID();
    if (!serviceId || !reservationDate || !reservationTime) {
      event.preventDefault();
      setFormError(!reservationDate ? "Informe a data desejada." : "Selecione um horário disponível.");
      return;
    }
    setFormError("");
  };

  return (
    <form className="mt-8 space-y-5" action={action} onSubmit={handleSubmit}>
      <input ref={idempotencyInput} type="hidden" name="idempotencyKey" />
      <input type="hidden" name="startsAt" value={startsAt} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {formError ? <p className="rounded-xl border border-[#f0caca] bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{formError}</p> : null}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <label className="text-sm font-medium" htmlFor="reservation-service">Serviço</label>
          <span className="text-sm text-[#716963]" aria-live="polite">Tempo: {selectedService ? formatDuration(selectedService.duration_minutes) : "—"}</span>
        </div>
        <SearchableSelect
          id="reservation-service"
          name="serviceId"
          placeholder="Pesquise por serviço"
          required
          defaultValue={initialServiceId}
          onValueChange={(value) => { setServiceId(value); setReservationTime(""); setFormError(""); }}
          options={services.map((service) => ({ value: service.service_id, label: service.service_name }))}
        />
      </div>

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
          <div className="mt-2"><MaskedDateInput value={reservationDate} onChange={(value) => { setReservationDate(value); setReservationTime(""); setFormError(""); }} required /></div>
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

"use client";

import { useEffect, useRef, useState } from "react";
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
  const datePickerRef = useRef<HTMLInputElement>(null);
  const timeOptions = Array.from({ length: 96 }, (_, index) => {
    const hours = String(Math.floor(index / 4)).padStart(2, "0");
    const minutes = String((index % 4) * 15).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  return (
    <form className="mt-8 space-y-5" action={action}>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <label className="block text-sm font-medium">
        Serviço
        <select className="mt-2 w-full rounded-xl border border-[#d9cec8] bg-white px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="serviceId" defaultValue="" required>
          <option value="" disabled>Selecione um serviço</option>
          {services.map((service) => (
            <option key={service.service_id} value={service.service_id}>
              {service.service_name} · {service.duration_minutes} min
            </option>
          ))}
        </select>
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
          <input
            ref={datePickerRef}
            className="mt-2 w-full cursor-pointer rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none"
            name="reservationDate"
            type="date"
            lang="pt-BR"
            required
            value={reservationDate}
            onChange={(event) => setReservationDate(event.target.value)}
            onFocus={() => {
              const picker = datePickerRef.current;
              if (!picker || !("showPicker" in picker)) return;
              try {
                (picker as HTMLInputElement & { showPicker: () => void }).showPicker();
              } catch {
                // O navegador já abriu o calendário no foco.
              }
            }}
          />
        </label>

        <label className="block text-sm font-medium">
          Horário (24h)
          <select
            className="mt-2 w-full rounded-xl border border-[#d9cec8] bg-white px-4 py-3 focus:border-[#8f4e68] focus:outline-none"
            name="reservationTime"
            required
            value={reservationTime}
            onChange={(event) => setReservationTime(event.target.value)}
          >
            <option value="" disabled>Selecione o horário</option>
            {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        </label>
      </div>

      <span className="-mt-2 block text-xs font-normal text-[#716963]">A data abre o calendário ao focar. O horário usa o padrão de 24 horas.</span>

      <input
        type="hidden"
        name="startsAt"
        value={reservationDate && reservationTime ? `${reservationDate}T${reservationTime}` : ""}
      />

      <input
        type="hidden"
        name="startsAt"
        value={reservationDate && reservationTime ? `${reservationDate}T${reservationTime}` : ""}
      />

      <SubmitButton />
    </form>
  );
}

"use client";

import { useState } from "react";
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

function formatDateTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  const hour = digits.slice(8, 10);
  const minute = digits.slice(10, 12);

  let formatted = day;
  if (month) formatted += `/${month}`;
  if (year) formatted += `/${year}`;
  if (hour) formatted += ` ${hour}`;
  if (minute) formatted += `:${minute}`;
  return formatted;
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
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [phone, setPhone] = useState("");
  const [reservationDateTime, setReservationDateTime] = useState("");

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

      <label className="block text-sm font-medium">
        Data e horário desejados
        <input
          className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none"
          name="reservationDateTime"
          inputMode="numeric"
          autoComplete="off"
          maxLength={16}
          pattern="[0-9]{2}/[0-9]{2}/[0-9]{4} [0-9]{2}:[0-9]{2}"
          placeholder="DD/MM/AAAA HH:MM"
          required
          value={reservationDateTime}
          onChange={(event) => setReservationDateTime(formatDateTimeInput(event.target.value))}
        />
        <span className="mt-2 block text-xs font-normal text-[#716963]">Use o formato dia/mês/ano e horário de 24 horas.</span>
      </label>

      <input
        type="hidden"
        name="startsAt"
        value={reservationDateTime.length === 16
          ? `${reservationDateTime.slice(6, 10)}-${reservationDateTime.slice(3, 5)}-${reservationDateTime.slice(0, 2)}T${reservationDateTime.slice(11, 16)}`
          : ""}
      />

      <SubmitButton />
    </form>
  );
}

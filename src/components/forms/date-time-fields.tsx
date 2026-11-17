"use client";

import { useState } from "react";
import SearchableSelect from "@/components/forms/searchable-select";
import MaskedDateInput from "@/components/forms/masked-date-input";

type DateTimeFieldsProps = { name: string; label?: string; commercialHours?: boolean; initialDate?: string; initialTime?: string };

export default function DateTimeFields({ name, label = "Data e horário", commercialHours = false, initialDate = "", initialTime = "" }: DateTimeFieldsProps) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const firstHour = commercialHours ? 8 : 0;
  const lastHour = commercialHours ? 18 : 23;
  const timeOptions = Array.from({ length: (lastHour - firstHour) * 4 + 1 }, (_, index) => `${String(firstHour + Math.floor(index / 4)).padStart(2, "0")}:${String((index % 4) * 15).padStart(2, "0")}`);

  return <div><p className="text-sm font-medium">{label}</p><div className="mt-2 grid gap-3 sm:grid-cols-2"><MaskedDateInput value={date} onChange={setDate} required /><SearchableSelect name={`${name}Time`} placeholder="Horário (24h)" required options={timeOptions.map((option) => ({ value: option, label: option }))} onValueChange={setTime} /></div><input type="hidden" name={name} value={date && time ? `${date}T${time}` : ""} /><span className="mt-2 block text-xs font-normal text-[#716963]">Data com calendário e horário no padrão de 24 horas.</span></div>;
}

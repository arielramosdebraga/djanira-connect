"use client";

import { useRef, useState } from "react";
import SearchableSelect from "@/components/forms/searchable-select";

type DateTimeFieldsProps = { name: string; label?: string; commercialHours?: boolean };

export default function DateTimeFields({ name, label = "Data e horário", commercialHours = false }: DateTimeFieldsProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const datePickerRef = useRef<HTMLInputElement>(null);
  const firstHour = commercialHours ? 8 : 0;
  const lastHour = commercialHours ? 18 : 23;
  const timeOptions = Array.from({ length: (lastHour - firstHour) * 4 + 1 }, (_, index) => `${String(firstHour + Math.floor(index / 4)).padStart(2, "0")}:${String((index % 4) * 15).padStart(2, "0")}`);

  return <div><p className="text-sm font-medium">{label}</p><div className="mt-2 grid gap-3 sm:grid-cols-2"><input ref={datePickerRef} className="w-full cursor-pointer rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" type="date" lang="pt-BR" required value={date} onChange={(event) => setDate(event.target.value)} onFocus={() => { const picker = datePickerRef.current; if (!picker || !("showPicker" in picker)) return; try { (picker as HTMLInputElement & { showPicker: () => void }).showPicker(); } catch { /* O navegador já abriu o calendário. */ } }} /><SearchableSelect name={`${name}Time`} placeholder="Horário (24h)" required options={timeOptions.map((option) => ({ value: option, label: option }))} onValueChange={setTime} /></div><input type="hidden" name={name} value={date && time ? `${date}T${time}` : ""} /><span className="mt-2 block text-xs font-normal text-[#716963]">Data com calendário e horário no padrão de 24 horas.</span></div>;
}

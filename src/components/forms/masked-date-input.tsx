"use client";

import { useRef } from "react";

function toDisplayDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

type MaskedDateInputProps = { value: string; onChange: (value: string) => void; required?: boolean };

export default function MaskedDateInput({ value, onChange, required = false }: MaskedDateInputProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  return <div className="relative"><input className="w-full cursor-pointer rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" type="text" inputMode="numeric" placeholder="DD/MM/AAAA" value={toDisplayDate(value)} readOnly required={required} onFocus={() => { const picker = pickerRef.current; if (!picker || !("showPicker" in picker)) return; try { (picker as HTMLInputElement & { showPicker: () => void }).showPicker(); } catch { /* O navegador já abriu o calendário. */ } }} /><input ref={pickerRef} className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0" type="date" lang="pt-BR" value={value} tabIndex={-1} aria-hidden="true" onChange={(event) => onChange(event.target.value)} /></div>;
}

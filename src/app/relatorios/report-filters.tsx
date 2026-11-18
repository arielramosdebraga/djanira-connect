"use client";

import { FormEvent, useState } from "react";
import MaskedDateInput from "@/components/forms/masked-date-input";

type ReportFiltersProps = {
  initialStartDate: string;
  initialEndDate: string;
  initialEmployeeName: string;
  initialPercentage: string;
};

export default function ReportFilters({ initialStartDate, initialEndDate, initialEmployeeName, initialPercentage }: ReportFiltersProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [employeeName, setEmployeeName] = useState(initialEmployeeName);
  const [percentage, setPercentage] = useState(initialPercentage);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!startDate || !endDate) event.preventDefault();
  }

  return <form className="no-print mt-6 grid gap-4 rounded-2xl border border-[#eee8e3] bg-[#fcfbfa] p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_0.8fr_auto] lg:items-end" action="/relatorios" method="get" onSubmit={handleSubmit}>
    <label className="block text-sm font-medium">Data inicial<MaskedDateInput value={startDate} onChange={setStartDate} required /></label>
    <label className="block text-sm font-medium">Data final<MaskedDateInput value={endDate} onChange={setEndDate} required /></label>
    <label className="block text-sm font-medium">Funcionário<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="funcionario" value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} placeholder="Ex.: Djanira" /></label>
    <label className="block text-sm font-medium">Percentual<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="percentual" type="number" min="0" max="100" step="0.01" inputMode="decimal" value={percentage} onChange={(event) => setPercentage(event.target.value)} placeholder="0" /></label>
    <input name="inicio" type="hidden" value={startDate} />
    <input name="fim" type="hidden" value={endDate} />
    <button className="rounded-xl bg-[#8f4e68] px-5 py-3 font-semibold text-white hover:bg-[#69344b]" type="submit">Aplicar filtros</button>
  </form>;
}

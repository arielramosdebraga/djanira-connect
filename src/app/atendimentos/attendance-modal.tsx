"use client";

import { useState } from "react";
import AttendanceForm from "@/app/atendimentos/attendance-form";

type AttendanceModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  customers: Array<{ id: string; name: string; phone_normalized: string }>;
  services: Array<{ id: string; name: string; average_price_cents: number | null }>;
};

export default function AttendanceModal({ action, customers, services }: AttendanceModalProps) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="rounded-xl bg-[#8f4e68] px-5 py-3 font-semibold text-white hover:bg-[#69344b]" type="button" onClick={() => setOpen(true)}>Novo atendimento</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="new-attendance-title"><div className="modal-scrollbar max-h-[92vh] overflow-y-auto p-6 sm:p-8"><div className="sticky top-0 z-10 -mx-6 -mt-6 flex items-start justify-between gap-4 bg-white px-6 pb-4 pt-6 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Atendimentos</p><h2 id="new-attendance-title" className="mt-2 text-2xl font-semibold">Novo atendimento</h2></div><button className="rounded-lg px-3 py-2 text-xl text-[#716963] hover:bg-[#f8f7f4]" type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button></div>{!customers.length || !services.length ? <p className="mt-6 rounded-2xl bg-[#faf5f7] p-5 text-sm leading-6 text-[#69344b]">Cadastre pelo menos um contato e um serviço antes de registrar um atendimento.</p> : <AttendanceForm action={action} customers={customers} services={services} />}</div></section></div> : null}
  </>;
}

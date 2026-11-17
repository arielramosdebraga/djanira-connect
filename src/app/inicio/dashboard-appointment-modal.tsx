"use client";

import { useState } from "react";
import AppointmentForm from "@/app/agenda/appointment-form";

type DashboardAppointmentModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  customers: Array<{ id: string; name: string; phone_normalized: string }>;
  services: Array<{ id: string; name: string }>;
};

export default function DashboardAppointmentModal({ action, customers, services }: DashboardAppointmentModalProps) {
  const [open, setOpen] = useState(false);

  return <>
    <button className="rounded-xl bg-[#8f4e68] px-5 py-3 font-semibold text-white hover:bg-[#69344b]" type="button" onClick={() => setOpen(true)}>Incluir novo agendamento</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="new-appointment-title"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Agenda</p><h2 id="new-appointment-title" className="mt-2 text-2xl font-semibold">Novo agendamento</h2></div><button className="rounded-lg px-3 py-2 text-xl text-[#716963] hover:bg-[#f8f7f4]" type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button></div>{!customers.length || !services.length ? <p className="mt-6 rounded-2xl bg-[#faf5f7] p-5 text-sm leading-6 text-[#69344b]">Cadastre pelo menos um cliente e um serviço antes de agendar.</p> : <AppointmentForm action={action} customers={customers} services={services} />}</section></div> : null}
  </>;
}

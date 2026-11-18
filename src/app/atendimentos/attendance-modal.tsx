"use client";

import { useEffect, useRef, useState } from "react";
import AttendanceForm from "@/app/atendimentos/attendance-form";
import { createClient } from "@/lib/supabase/browser";

type AttendanceModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  customers: Array<{ id: string; name: string; phone_normalized: string }>;
  services: Array<{ id: string; name: string; average_price_cents: number | null }>;
  professionals?: Array<{ id: string; name: string; default_commission_rate: number }>;
};

export default function AttendanceModal({ action, customers, services, professionals = [] }: AttendanceModalProps) {
  const [open, setOpen] = useState(false);
  const [availableProfessionals, setAvailableProfessionals] = useState(professionals);
  const professionalsLoaded = useRef(professionals.length > 0);
  useEffect(() => { if (!open || professionalsLoaded.current) return; professionalsLoaded.current = true; createClient().from("professionals").select("id, name, default_commission_rate").eq("active", true).order("name").then(({ data }) => setAvailableProfessionals((data ?? []) as typeof professionals)); }, [open]);
  return <>
    <button className="rounded-xl bg-[#8f4e68] px-5 py-3 font-semibold text-white hover:bg-[#69344b]" type="button" onClick={() => setOpen(true)}>Novo atendimento</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="new-attendance-title">
        <div className="flex items-start justify-between gap-4 border-b border-[#f1ece8] px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
          <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Atendimentos</p><h2 id="new-attendance-title" className="mt-2 text-2xl font-semibold">Novo atendimento</h2></div>
          <button className="rounded-lg px-3 py-2 text-xl text-[#716963] hover:bg-[#f8f7f4]" type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="modal-scrollbar max-h-[calc(92vh-9rem)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
          {!customers.length || !services.length ? <p className="mt-6 rounded-2xl bg-[#faf5f7] p-5 text-sm leading-6 text-[#69344b]">Cadastre pelo menos um contato e um serviço antes de registrar um atendimento.</p> : <AttendanceForm action={action} customers={customers} services={services} professionals={availableProfessionals} />}
        </div>
      </section>
    </div> : null}
  </>;
}

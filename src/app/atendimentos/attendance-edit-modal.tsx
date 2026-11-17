"use client";

import { useState } from "react";
import AttendanceForm from "@/app/atendimentos/attendance-form";

type AttendanceEditModalProps = {
  action: (formData: FormData) => void | Promise<void>;
  attendance: { id: string; customer_id: string; service_id: string; performed_at: string; price_cents: number | null; notes: string | null };
  customers: Array<{ id: string; name: string; phone_normalized: string }>;
  services: Array<{ id: string; name: string; average_price_cents: number | null }>;
  initialDate: string;
  initialTime: string;
};

export default function AttendanceEditModal({ action, attendance, customers, services, initialDate, initialTime }: AttendanceEditModalProps) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="rounded-xl border border-[#d9cec8] px-4 py-2.5 text-sm font-semibold hover:border-[#8f4e68]" type="button" onClick={() => setOpen(true)}>Corrigir</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="edit-attendance-title">
        <div className="flex items-start justify-between gap-4 border-b border-[#f1ece8] px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
          <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Atendimentos</p><h2 id="edit-attendance-title" className="mt-2 text-2xl font-semibold">Corrigir atendimento</h2><p className="mt-2 text-sm text-[#716963]">Atualize os dados e salve a correção.</p></div>
          <button className="rounded-lg px-3 py-2 text-xl text-[#716963] hover:bg-[#f8f7f4]" type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="modal-scrollbar max-h-[calc(92vh-10.5rem)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
          <AttendanceForm action={action} customers={customers} services={services} attendanceId={attendance.id} initialCustomerId={attendance.customer_id} initialServiceId={attendance.service_id} initialDate={initialDate} initialTime={initialTime} initialPriceCents={attendance.price_cents} initialNotes={attendance.notes ?? ""} submitLabel="Salvar correção" />
        </div>
      </section>
    </div> : null}
  </>;
}

"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b] disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">{pending ? "Salvando..." : "Cadastrar serviço"}</button>;
}

export default function ServiceModal({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  const [open, setOpen] = useState(false);

  return <>
    <button className="rounded-xl bg-[#8f4e68] px-5 py-3 font-semibold text-white hover:bg-[#69344b]" type="button" onClick={() => setOpen(true)}>Novo serviço</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="new-service-title">
        <div className="flex items-start justify-between gap-4 border-b border-[#f1ece8] px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
          <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Catálogo</p><h2 id="new-service-title" className="mt-2 text-2xl font-semibold">Novo serviço</h2><p className="mt-2 text-sm text-[#716963]">O prazo de retorno é opcional e alimenta os lembretes.</p></div>
          <button className="rounded-lg px-3 py-2 text-xl text-[#716963] hover:bg-[#f8f7f4]" type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="modal-scrollbar max-h-[calc(92vh-10rem)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
          <form className="pt-5 space-y-4" action={action}><label className="block text-sm font-medium">Nome<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="name" required data-validation-message="Informe o nome do serviço." /></label><label className="block text-sm font-medium">Valor médio<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="averagePrice" inputMode="decimal" placeholder="Ex.: 80,00" /></label><label className="block text-sm font-medium">Duração média (minutos)<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="durationMinutes" type="number" min="1" required data-validation-message="Informe a duração do serviço." /></label><label className="block text-sm font-medium">Prazo de retorno (dias)<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="returnPeriodDays" type="number" min="1" /></label><SubmitButton /></form>
        </div>
      </section>
    </div> : null}
  </>;
}

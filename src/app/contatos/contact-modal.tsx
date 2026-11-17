"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import PhoneInput from "@/components/forms/phone-input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Salvando..." : "Cadastrar contato"}</button>;
}

export default function ContactModal({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="rounded-xl bg-[#8f4e68] px-5 py-3 font-semibold text-white hover:bg-[#69344b]" type="button" onClick={() => setOpen(true)}>Novo contato</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="new-contact-title"><div className="modal-scrollbar max-h-[92vh] overflow-y-auto p-6 sm:p-8"><div className="sticky top-0 z-10 -mx-6 -mt-6 flex items-start justify-between gap-4 bg-white px-6 pb-4 pt-6 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Contatos</p><h2 id="new-contact-title" className="mt-2 text-2xl font-semibold">Novo contato</h2></div><button className="rounded-lg px-3 py-2 text-xl text-[#716963] hover:bg-[#f8f7f4]" type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button></div><form className="mt-5 space-y-4" action={action}><label className="block text-sm font-medium">Nome<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="name" required data-validation-message="Informe o nome do contato." /></label><label className="block text-sm font-medium">Telefone ou WhatsApp<PhoneInput name="phone" required /></label><label className="block text-sm font-medium">Observações<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="notes" maxLength={500} /></label><label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1 size-4 accent-[#8f4e68]" name="doNotContact" type="checkbox" />Não realizar contatos de retorno</label><label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1 size-4 accent-[#8f4e68]" name="allowSharedPhone" type="checkbox" />Permitir telefone compartilhado com outro contato</label><SubmitButton /></form></div></section></div> : null}
  </>;
}

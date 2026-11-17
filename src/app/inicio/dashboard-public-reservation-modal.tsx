"use client";

import { useState } from "react";

export default function DashboardPublicReservationModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const reservationPath = "/reservar";

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${reservationPath}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <>
    <button className="rounded-xl border border-[#d9cec8] bg-white px-4 py-2.5 text-sm font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" type="button" onClick={() => setOpen(true)}>Abrir reservas públicas</button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="public-reservation-title"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Reservas</p><h2 id="public-reservation-title" className="mt-2 text-2xl font-semibold">Página pública de reservas</h2></div><button className="rounded-lg px-3 py-2 text-xl text-[#716963] hover:bg-[#f8f7f4]" type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button></div><p className="mt-5 leading-6 text-[#716963]">Compartilhe este endereço para que suas clientes escolham o serviço, a data e um horário disponível.</p><div className="mt-5 rounded-xl border border-[#e8e1dc] bg-[#faf7f5] p-4"><p className="break-all text-sm font-semibold text-[#69344b]">{reservationPath}</p></div><div className="mt-5 flex flex-wrap gap-3"><a className="rounded-xl bg-[#8f4e68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#69344b]" href={reservationPath} target="_blank" rel="noreferrer">Abrir página</a><button className="rounded-xl border border-[#d9cec8] px-5 py-3 text-sm font-semibold hover:border-[#8f4e68]" type="button" onClick={copyLink}>{copied ? "Link copiado" : "Copiar link"}</button></div></section></div> : null}
  </>;
}

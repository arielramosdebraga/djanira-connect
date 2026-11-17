"use client";

import { useState } from "react";
import ReservationForm from "@/app/reservar/reservation-form";
import { createPublicReservationAction } from "@/app/reservar/actions";

type PublicReservationService = { service_id: string; service_name: string; duration_minutes: number };

export default function DashboardPublicReservationModal({ services }: { services: PublicReservationService[] }) {
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
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29231f]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="public-reservation-title"><div className="modal-scrollbar max-h-[92vh] overflow-y-auto p-6 sm:p-8"><div className="sticky top-0 z-10 -mx-6 -mt-6 flex items-start justify-between gap-4 bg-white px-6 pb-4 pt-6 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Reservas</p><h2 id="public-reservation-title" className="mt-2 text-2xl font-semibold">Página pública de reservas</h2></div><button className="rounded-lg px-3 py-2 text-xl text-[#716963] hover:bg-[#f8f7f4]" type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button></div><p className="mt-5 leading-6 text-[#716963]">O mesmo formulário público também pode ser usado diretamente daqui.</p><ReservationForm action={createPublicReservationAction} services={services} returnTo="/inicio" /><div className="mt-6 border-t border-[#eee8e3] pt-5"><p className="text-sm text-[#716963]">Link para compartilhar com suas clientes: <span className="font-semibold text-[#69344b]">{reservationPath}</span></p><div className="mt-3 flex flex-wrap gap-3"><a className="rounded-xl border border-[#d9cec8] px-5 py-3 text-sm font-semibold hover:border-[#8f4e68]" href={reservationPath} target="_blank" rel="noreferrer">Abrir página separada</a><button className="rounded-xl border border-[#d9cec8] px-5 py-3 text-sm font-semibold hover:border-[#8f4e68]" type="button" onClick={copyLink}>{copied ? "Link copiado" : "Copiar link"}</button></div></div></div></section></div> : null}
  </>;
}

import { createPublicReservationAction } from "@app/reservar/actions";
import ReservationForm from "@app/reservar/reservation-form";
import wordmark from "@assets/djanira-wordmark.png";
import { getPublicCatalog, getPublicContact } from "@lib/firebase/public";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";

type ReservationPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };
type PublicContact = { whatsapp_phone: string | null };

export const metadata = { title: "Reservar atendimento" };
export const instant = false;

export default async function ReservationPage({ searchParams }: ReservationPageProps) {
  await connection();
  const params = await searchParams;
  const [services, contact] = await Promise.all([getPublicCatalog(), getPublicContact()]) as [Array<{ service_id: string; service_name: string; duration_minutes: number }>, PublicContact];
  const whatsappUrl = contact?.whatsapp_phone
    ? `https://wa.me/${contact.whatsapp_phone}?text=${encodeURIComponent("Olá! Acabei de solicitar uma reserva pelo site.")}`
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-[#e8e1dc] bg-white p-7 shadow-[0_24px_80px_rgba(91,55,37,0.08)] sm:p-9">
        <Image src={wordmark} alt="Djanira Montclair" width={210} height={70} className="h-auto w-48 object-contain" priority />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Solicitar reserva</h1>
        <p className="mt-3 leading-6 text-[#716963]">Escolha o serviço, informe seus dados e o horário desejado.</p>
        {params.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm leading-6 text-[#9b3e3e]" role="alert">{params.erro}</p> : null}
        {params.resultado ? <div className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm leading-6 text-[#287342]" role="status"><p>Solicitação recebida. O salão confirmará o atendimento.</p>{whatsappUrl ? <a className="mt-4 inline-flex rounded-lg bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1da851]" href={whatsappUrl} target="_blank" rel="noreferrer">Falar com o salão no WhatsApp</a> : null}</div> : services.length ? <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-[#faf5f7]" />}><ReservationForm action={createPublicReservationAction} services={services} /></Suspense> : <p className="mt-8 rounded-2xl bg-[#faf5f7] p-5 text-sm leading-6 text-[#69344b]">Nenhum serviço está disponível para reserva no momento.</p>}
      </section>
    </main>
  );
}

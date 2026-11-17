import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ReservationForm from "@/app/reservar/reservation-form";
import { createPublicReservationAction } from "@/app/reservar/actions";

type ReservationPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };
export const metadata = { title: "Reservar atendimento" };
export const instant = false;

export default async function ReservationPage({ searchParams }: ReservationPageProps) {
  const params = await searchParams;
  const { data: services } = await (await createClient()).rpc("get_public_reservation_catalog");
  return <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-12"><section className="w-full max-w-lg rounded-[2rem] border border-[#e8e1dc] bg-white p-7 shadow-[0_24px_80px_rgba(91,55,37,0.08)] sm:p-9"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Djanira Connect</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Solicitar reserva</h1><p className="mt-3 leading-6 text-[#716963]">Escolha o serviço, informe seus dados e o horário desejado.</p>{params.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm leading-6 text-[#9b3e3e]" role="alert">{params.erro}</p> : null}{params.resultado ? <p className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm leading-6 text-[#287342]" role="status">Solicitação recebida. O salão confirmará o atendimento.</p> : services?.length ? <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-[#faf5f7]" />}><ReservationForm action={createPublicReservationAction} services={services} /></Suspense> : <p className="mt-8 rounded-2xl bg-[#faf5f7] p-5 text-sm leading-6 text-[#69344b]">Nenhum serviço está disponível para reserva no momento.</p>}</section></main>;
}

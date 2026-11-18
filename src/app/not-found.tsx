import Image from "next/image";
import Link from "next/link";
import wordmark from "../../assets/djanira-wordmark.png";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f0e6] px-6 py-12 text-[#2c241d]"><section className="w-full max-w-xl rounded-[2rem] border border-[#e5d7c7] bg-white p-8 text-center shadow-[0_24px_80px_rgba(92,55,27,0.08)] sm:p-12"><Image src={wordmark} alt="Djanira Montclair" width={300} height={100} className="mx-auto h-auto w-56 object-contain" priority /><p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#a96532]">Página não encontrada</p><h1 className="mt-4 text-6xl font-semibold tracking-tight text-[#75401f]">404</h1><p className="mx-auto mt-4 max-w-md leading-7 text-[#76695c]">A página que você tentou acessar não existe ou foi movida. Escolha uma das opções para continuar.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="rounded-full bg-[#a96532] px-6 py-3.5 font-semibold text-white transition hover:bg-[#75401f]" href="/">Voltar para início</Link><Link className="rounded-full border border-[#d8c3a8] px-6 py-3.5 font-semibold text-[#75401f] transition hover:border-[#a96532]" href="/reservar">Reservar horário</Link></div></section></main>;
}

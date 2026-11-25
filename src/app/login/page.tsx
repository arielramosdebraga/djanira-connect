import Link from "next/link";
import { Suspense } from "react";

import LoginForm from "./login-form";

export const metadata = { title: "Entrar" };
export const instant = false;

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-[#e8e1dc] bg-white p-7 shadow-[0_24px_80px_rgba(91,55,37,0.08)] sm:p-9">
        <Link className="text-sm font-semibold text-[#8f4e68]" href="/">← Voltar para início</Link>
        <div className="mt-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Acesso privado</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Entrar no Djanira Connect</h1><p className="mt-3 leading-6 text-[#716963]">Use a conta individual criada para você.</p></div>
        <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-xl bg-[#faf5f7]" />}><LoginForm /></Suspense>
        <p className="mt-6 text-center text-sm text-[#716963]"><Link className="font-semibold text-[#8f4e68] hover:underline" href="/recuperar-acesso">Esqueci minha senha</Link></p>
      </section>
    </main>
  );
}

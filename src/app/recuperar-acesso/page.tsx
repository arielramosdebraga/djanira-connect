import Link from "next/link";
import { Suspense } from "react";
import RecoveryForm from "./recovery-form";

export const metadata = { title: "Recuperar acesso" };

export default function RecoverAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-[#e8e1dc] bg-white p-7 shadow-[0_24px_80px_rgba(91,55,37,0.08)] sm:p-9">
        <Link className="text-sm font-semibold text-[#8f4e68]" href="/login">← Voltar para login</Link>
        <Suspense fallback={<div className="mt-8 h-36 animate-pulse rounded-xl bg-[#faf5f7]" />}><RecoveryForm /></Suspense>
      </section>
    </main>
  );
}

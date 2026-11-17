import Link from "next/link";

export const metadata = { title: "Recuperar acesso" };

export default function RecoverAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-[#e8e1dc] bg-white p-7 shadow-[0_24px_80px_rgba(91,55,37,0.08)] sm:p-9">
        <Link className="text-sm font-semibold text-[#8f4e68]" href="/login">← Voltar para login</Link>
        <div className="mt-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Recuperação</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Recuperar acesso</h1><p className="mt-3 leading-6 text-[#716963]">A recuperação será habilitada junto da configuração do e-mail do Supabase.</p></div>
        <div className="mt-8 rounded-2xl bg-[#faf5f7] p-5 text-sm leading-6 text-[#69344b]">Peça ao administrador o procedimento de recuperação enquanto o ambiente ainda está sendo configurado.</div>
      </section>
    </main>
  );
}

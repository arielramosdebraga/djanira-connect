import Link from "next/link";

type RecoveryPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };

export const metadata = { title: "Recuperar acesso" };

export default async function RecoverAccessPage({ searchParams }: RecoveryPageProps) {
  const params = await searchParams;
  const message = params.resultado === "enviado"
    ? "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação."
    : params.erro
      ? "Informe um e-mail válido para continuar."
      : "Usaremos o e-mail cadastrado para enviar as instruções.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-[#e8e1dc] bg-white p-7 shadow-[0_24px_80px_rgba(91,55,37,0.08)] sm:p-9">
        <Link className="text-sm font-semibold text-[#8f4e68]" href="/login">← Voltar para login</Link>
        <div className="mt-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Recuperação</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Recuperar acesso</h1><p className="mt-3 leading-6 text-[#716963]">{message}</p></div>
        <form className="mt-8 space-y-5" action="/auth/recover" method="post">
          <label className="block text-sm font-medium" htmlFor="email">E-mail<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:ring-2 focus:ring-[#f1dce5]" id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required /></label>
          <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white transition hover:bg-[#69344b]" type="submit">Enviar instruções</button>
        </form>
      </section>
    </main>
  );
}

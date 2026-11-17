import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8f4e68]">Djanira Connect</p>
            <p className="mt-1 text-sm text-[#716963]">Gestão simples para a rotina do salão</p>
          </div>
          <Link className="rounded-full border border-[#d9cec8] px-5 py-2.5 text-sm font-semibold transition hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/login">Entrar</Link>
        </header>

        <section className="grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Organização no dia a dia</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">Seus clientes e retornos no mesmo lugar.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#716963]">Cadastre serviços, registre atendimentos e saiba quem precisa de um novo contato.</p>
            <Link className="mt-9 inline-flex rounded-full bg-[#8f4e68] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#69344b]" href="/login">Acessar o sistema</Link>
          </div>

          <div className="rounded-[2rem] border border-[#e8e1dc] bg-white p-6 shadow-[0_24px_80px_rgba(91,55,37,0.08)] sm:p-8">
            <div className="flex items-center justify-between border-b border-[#eee8e3] pb-5">
              <div><p className="text-sm text-[#716963]">Visão geral</p><h2 className="mt-1 text-xl font-semibold">Acompanhe sua rotina</h2></div>
              <span className="rounded-full bg-[#f7e9ef] px-3 py-1 text-xs font-semibold text-[#8f4e68]">Em preparação</span>
            </div>
            <div className="grid gap-3 py-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#faf5f7] p-5"><p className="text-sm text-[#716963]">Retornos de hoje</p><p className="mt-3 text-3xl font-semibold">—</p></div>
              <div className="rounded-2xl bg-[#f8f7f4] p-5"><p className="text-sm text-[#716963]">Atendimentos</p><p className="mt-3 text-3xl font-semibold">—</p></div>
            </div>
            <p className="text-sm leading-6 text-[#716963]">A primeira versão está sendo construída para começar pelos serviços, contatos e retornos.</p>
          </div>
        </section>

        <footer className="border-t border-[#e8e1dc] py-5 text-sm text-[#716963]">Acesso privado para a equipe do salão.</footer>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Início" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  } catch {
    redirect("/login?erro=configuracao-indisponivel");
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8f4e68]">Djanira Connect</p><h1 className="mt-2 text-3xl font-semibold">Início</h1></div><Link className="rounded-full border border-[#d9cec8] px-5 py-2.5 text-sm font-semibold hover:border-[#8f4e68] hover:text-[#8f4e68]" href="/auth/logout">Sair</Link></header>
        <section className="mt-10 rounded-[2rem] border border-[#e8e1dc] bg-white p-7 sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f4e68]">Fundação em andamento</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Seu painel vai aparecer aqui.</h2><p className="mt-4 max-w-2xl leading-7 text-[#716963]">A estrutura inicial está pronta. Os próximos módulos vão preencher serviços, contatos, atendimentos e retornos nesta área.</p></section>
      </div>
    </main>
  );
}

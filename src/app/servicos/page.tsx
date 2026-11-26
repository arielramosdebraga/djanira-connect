import { createServiceAction } from "@app/servicos/actions";
import ServiceList from "@app/servicos/service-list";
import ServiceModal from "@app/servicos/service-modal";
import { requireActiveMember } from "@lib/auth/session";
import Link from "next/link";

type ServicesPageProps = { searchParams: Promise<{ erro?: string; resultado?: string }> };

export const metadata = { title: "Serviços" };
export const instant = false;

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { membership, firebase } = await requireActiveMember();
  const params = await searchParams;
  const { data: services, error } = await firebase.collection("services").select("id, name, average_price_cents, duration_minutes, return_period_days, active").eq("organization_id", membership.organization_id).order("active", { ascending: false }).order("name");
  const isAdmin = membership.role === "admin";

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4"><div><Link className="text-sm font-semibold text-[#8f4e68]" href="/inicio">← Início</Link><h1 className="mt-3 text-3xl font-semibold">Serviços</h1><p className="mt-2 text-[#716963]">Organize o catálogo usado nos atendimentos.</p></div>{isAdmin ? <ServiceModal action={createServiceAction} /> : null}</header>
        {params.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{params.erro === "sem-permissao" ? "Somente administradores podem alterar serviços." : params.erro}</p> : null}
        {params.resultado ? <p className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">Alteração realizada com sucesso.</p> : null}
        {error ? <p className="mt-8 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]">Não foi possível carregar os serviços.</p> : <ServiceList services={services ?? []} isAdmin={isAdmin} />}
      </div>
    </main>
  );
}

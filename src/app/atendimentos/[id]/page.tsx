import { updateAttendanceAction } from "@app/atendimentos/actions";
import DateTimeFields from "@components/forms/date-time-fields";
import SearchableSelect from "@components/forms/searchable-select";
import { formatPhone } from "@domains/contacts/phone";
import { requireActiveMember } from "@lib/auth/session";
import Link from "next/link";
import { notFound } from "next/navigation";

type EditPageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string; resultado?: string }> };

export const instant = false;

function toLocalFields(value: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

export default async function EditAttendancePage({ params, searchParams }: EditPageProps) {
  const { membership, supabase } = await requireActiveMember();
  if (membership.role !== "admin") notFound();
  const { id } = await params;
  const [{ data: attendance }, { data: customers }, { data: services }] = await Promise.all([
    supabase.from("attendances").select("id, customer_id, service_id, performed_at, price_cents, notes, status").eq("id", id).eq("organization_id", membership.organization_id).maybeSingle(),
    supabase.from("customers").select("id, name, phone_normalized").eq("organization_id", membership.organization_id).eq("status", "active").order("name"),
    supabase.from("services").select("id, name").eq("organization_id", membership.organization_id).eq("active", true).order("name"),
  ]);
  if (!attendance || attendance.status !== "completed") notFound();
  const query = await searchParams;
  const fields = toLocalFields(attendance.performed_at);
  return <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#29231f] sm:px-10"><div className="mx-auto max-w-2xl"><Link className="text-sm font-semibold text-[#8f4e68]" href="/atendimentos">← Atendimentos</Link><h1 className="mt-3 text-3xl font-semibold">Corrigir atendimento</h1><p className="mt-2 text-[#716963]">A alteração recalcula o retorno do cliente preservando o histórico.</p>{query.erro ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm text-[#9b3e3e]" role="alert">{query.erro}</p> : null}{query.resultado ? <p className="mt-6 rounded-xl bg-[#edf8f0] p-4 text-sm text-[#287342]" role="status">Atendimento atualizado e retorno reavaliado.</p> : null}<form className="mt-8 space-y-5 rounded-[2rem] border border-[#e8e1dc] bg-white p-6 sm:p-8" action={updateAttendanceAction}><input type="hidden" name="attendanceId" value={attendance.id} /><label className="block text-sm font-medium">Contato<SearchableSelect name="customerId" placeholder="Pesquise por nome ou telefone" required defaultValue={attendance.customer_id} options={(customers ?? []).map((customer) => ({ value: customer.id, label: `${customer.name} — ${formatPhone(customer.phone_normalized)}` }))} /></label><label className="block text-sm font-medium">Serviço<SearchableSelect name="serviceId" placeholder="Pesquise por serviço" required defaultValue={attendance.service_id} options={(services ?? []).map((service) => ({ value: service.id, label: service.name }))} /></label><DateTimeFields name="performedAt" initialDate={fields.date} initialTime={fields.time} /><label className="block text-sm font-medium">Valor praticado<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="price" inputMode="decimal" defaultValue={attendance.price_cents === null ? "" : (attendance.price_cents / 100).toFixed(2).replace(".", ",")} /></label><label className="block text-sm font-medium">Observações<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name="notes" maxLength={500} defaultValue={attendance.notes ?? ""} /></label><button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white hover:bg-[#69344b]" type="submit">Salvar correção</button></form></div></main>;
}

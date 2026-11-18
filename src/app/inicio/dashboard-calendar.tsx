"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  customers: { name: string } | Array<{ name: string }> | null;
  services: { name: string } | Array<{ name: string }> | null;
};

const dayNames = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const distance = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - distance);
  result.setHours(0, 0, 0, 0);
  return result;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function relatedName(value: CalendarAppointment["customers"] | CalendarAppointment["services"], fallback: string) {
  return Array.isArray(value) ? value[0]?.name ?? fallback : value?.name ?? fallback;
}

export default function DashboardCalendar({ appointments }: { appointments: CalendarAppointment[] }) {
  const [viewDate, setViewDate] = useState<Date | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setViewDate(new Date()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const week = useMemo(() => {
    if (!viewDate) return [];
    const firstDay = startOfWeek(viewDate);
    return dayNames.map((name, index) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + index);
      return { name, date, key: dateKey(date) };
    });
  }, [viewDate]);

  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarAppointment[]>();
    appointments.forEach((appointment) => {
      const key = dateKey(new Date(appointment.starts_at));
      grouped.set(key, [...(grouped.get(key) ?? []), appointment]);
    });
    grouped.forEach((items) => items.sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
    return grouped;
  }, [appointments]);

  if (!viewDate || !week.length) {
    return <div className="mt-8 h-96 animate-pulse rounded-[2rem] border border-[#e8e1dc] bg-white" />;
  }

  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(week[0].date);
  const todayKey = dateKey(new Date());

  return (
    <section className="mt-8 rounded-[2rem] border border-[#e8e1dc] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8f4e68]">Agenda</p>
          <h2 className="mt-2 text-2xl font-semibold capitalize">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-[#d9cec8] px-3 py-2 text-sm font-semibold hover:border-[#8f4e68]" type="button" onClick={() => setViewDate((date) => { const next = new Date(date ?? new Date()); next.setDate(next.getDate() - 7); return next; })}>←</button>
          <button className="rounded-lg border border-[#d9cec8] px-3 py-2 text-sm font-semibold hover:border-[#8f4e68]" type="button" onClick={() => setViewDate(new Date())}>Hoje</button>
          <button className="rounded-lg border border-[#d9cec8] px-3 py-2 text-sm font-semibold hover:border-[#8f4e68]" type="button" onClick={() => setViewDate((date) => { const next = new Date(date ?? new Date()); next.setDate(next.getDate() + 7); return next; })}>→</button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="grid min-w-[980px] grid-cols-7 divide-x divide-[#eee8e3] rounded-2xl border border-[#eee8e3]">
          {week.map((day) => {
            const dayAppointments = appointmentsByDay.get(day.key) ?? [];
            const isToday = day.key === todayKey;
            return (
              <div className="min-h-[390px] bg-white first:rounded-l-2xl last:rounded-r-2xl" key={day.key}>
                <div className={`border-b border-[#eee8e3] px-3 py-3 text-center ${isToday ? "bg-[#faf0f4]" : "bg-[#fcfbfa]"}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#716963]">{day.name}</p>
                  <p className={`mt-1 text-xl font-semibold ${isToday ? "text-[#8f4e68]" : "text-[#29231f]"}`}>{day.date.getDate()}</p>
                </div>
                <div className="space-y-2 p-2">
                  {dayAppointments.length ? dayAppointments.map((appointment) => (
                    <article className={`rounded-xl border p-3 text-xs ${appointment.status === "cancelled" ? "border-[#e8e1dc] bg-[#f8f7f4] opacity-60" : "border-[#e6cbd6] bg-[#faf0f4]"}`} key={appointment.id}>
                      <p className="font-semibold text-[#8f4e68]">{new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.starts_at))} – {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.ends_at))}</p>
                      <p className="mt-1 font-semibold text-[#29231f]">{relatedName(appointment.customers, "Cliente")}</p>
                      <p className="mt-1 text-[#716963]">{relatedName(appointment.services, "Serviço")}</p>
                      {appointment.status !== "scheduled" ? <p className="mt-1 font-semibold uppercase text-[#9b3e3e]">{appointment.status === "cancelled" ? "Cancelado" : "Concluído"}</p> : null}
                    </article>
                  )) : <p className="px-2 py-5 text-center text-xs text-[#aaa09a]">Sem compromissos</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-xs text-[#716963]">Consulte ou cadastre compromissos detalhados pela página <a className="font-semibold text-[#8f4e68] underline" href="/agenda">Agenda</a>.</p>
    </section>
  );
}

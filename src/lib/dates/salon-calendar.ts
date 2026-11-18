const salonTimeZone = "America/Sao_Paulo";

export function getSalonToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: salonTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function addCalendarDays(date: string, days: number) {
  const result = new Date(`${date}T12:00:00-03:00`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function getSalonWeekStart(date = getSalonToday()) {
  const parsed = new Date(`${date}T12:00:00Z`);
  const day = parsed.getUTCDay();
  parsed.setUTCDate(parsed.getUTCDate() - (day === 0 ? 6 : day - 1));
  return parsed.toISOString().slice(0, 10);
}

export function getSalonMonthStart(date = getSalonToday()) {
  return `${date.slice(0, 7)}-01`;
}

export function formatSalonDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: salonTimeZone, dateStyle: "medium" }).format(new Date(`${date}T12:00:00-03:00`));
}

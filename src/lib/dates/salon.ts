export function parseSalonDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Informe uma data e horário válidos.");
  const parsed = new Date(`${value}:00-03:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Informe uma data e horário válidos.");
  return parsed.toISOString();
}

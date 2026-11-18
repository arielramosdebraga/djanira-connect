export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : digits.length <= 11 ? `55${digits}` : digits;

  if (normalized.length < 12 || normalized.length > 15) {
    throw new Error("Informe um telefone válido com código do país.");
  }

  return normalized;
}

export function formatPhone(phone: string) {
  if (phone.startsWith("55") && phone.length === 13) {
    return `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
  }

  return `+${phone}`;
}

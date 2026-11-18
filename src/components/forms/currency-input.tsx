"use client";

import { useState } from "react";

function formatCurrency(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const cents = Number(digits) / 100;
  return cents.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CurrencyInput({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(() => defaultValue ? formatCurrency(defaultValue.replace(/\D/g, "")) : "");
  return <input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name={name} inputMode="decimal" placeholder="R$ 0,00" value={value} onChange={(event) => setValue(formatCurrency(event.target.value))} />;
}

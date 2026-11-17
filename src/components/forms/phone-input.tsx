"use client";

import { useState } from "react";

export function formatPhoneInput(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (!digits) return "";
  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  if (!number) return `(${areaCode}`;
  if (number.length <= 4) return `(${areaCode}) ${number}`;
  if (digits.length <= 10) return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`;
  return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

type PhoneInputProps = { name: string; defaultValue?: string; required?: boolean };

export default function PhoneInput({ name, defaultValue = "", required = false }: PhoneInputProps) {
  const [value, setValue] = useState(() => formatPhoneInput(defaultValue));
  return <input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 focus:border-[#8f4e68] focus:outline-none" name={name} inputMode="tel" maxLength={15} placeholder="(11) 99999-9999" required={required} value={value} onChange={(event) => setValue(formatPhoneInput(event.target.value))} />;
}

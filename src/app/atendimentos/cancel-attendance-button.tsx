"use client";

import { useFormStatus } from "react-dom";

export default function CancelAttendanceButton() {
  const { pending } = useFormStatus();
  return <button className="rounded-xl border border-[#d9cec8] px-4 py-2.5 text-sm font-semibold text-[#9b3e3e] hover:border-[#9b3e3e] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending} onClick={(event) => { if (!window.confirm("Cancelar este atendimento e reavaliar o retorno?")) event.preventDefault(); }}>{pending ? "Cancelando..." : "Cancelar"}</button>;
}

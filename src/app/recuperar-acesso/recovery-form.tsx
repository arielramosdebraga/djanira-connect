"use client";

import { useSearchParams } from "next/navigation";

export default function RecoveryForm() {
  const params = useSearchParams();
  const message = params.get("resultado") === "enviado"
    ? "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação."
    : params.get("resultado") === "falha" || params.get("erro")
      ? "Não foi possível iniciar a recuperação. Confira o e-mail e tente novamente."
      : "Usaremos o e-mail cadastrado para enviar as instruções.";

  return <><p className="mt-3 leading-6 text-[#716963]">{message}</p><form className="mt-8 space-y-5" action="/auth/recover" method="post"><label className="block text-sm font-medium" htmlFor="email">E-mail<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:ring-2 focus:ring-[#f1dce5]" id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required /></label><button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white transition hover:bg-[#69344b]" type="submit">Enviar instruções</button></form></>;
}

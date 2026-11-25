"use client";

import { getFirebaseClientAuth } from "@lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RecoveryForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState(params.get("resultado") === "enviado"
    ? "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação."
    : params.get("resultado") === "falha" || params.get("erro")
      ? "Não foi possível iniciar a recuperação. Confira o e-mail e tente novamente."
      : "Usaremos o e-mail cadastrado para enviar as instruções.");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    try {
      const auth = await getFirebaseClientAuth();
      await sendPasswordResetEmail(auth, email);
      setMessage("Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.");
    } catch {
      setMessage("Não foi possível iniciar a recuperação. Confira o e-mail e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return <><p className="mt-3 leading-6 text-[#716963]" role="status">{message}</p><form className="mt-8 space-y-5" onSubmit={handleSubmit}><label className="block text-sm font-medium" htmlFor="email">E-mail<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:ring-2 focus:ring-[#f1dce5]" id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required /></label><button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white transition hover:bg-[#69344b] disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? "Enviando…" : "Enviar instruções"}</button></form></>;
}

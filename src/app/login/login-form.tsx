"use client";

import { getFirebaseClientAuth } from "@lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const erro = useSearchParams().get("erro");
  const queryError = erro === "credenciais-invalidas"
    ? "E-mail ou senha inválidos."
    : erro === "sem-acesso"
      ? "Sua conta ainda não está vinculada a um salão ativo."
      : erro === "configuracao-indisponivel"
        ? "O serviço de acesso está temporariamente indisponível."
        : erro === "preencha-os-dados"
          ? "Preencha e-mail e senha para continuar."
          : null;
  const [errorMessage, setErrorMessage] = useState(queryError);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const auth = await getFirebaseClientAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        await auth.signOut();
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Não foi possível iniciar sua sessão.");
      }

      await auth.signOut();
      router.replace("/inicio");
      router.refresh();
    } catch (error) {
      const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
      setErrorMessage(code.includes("auth/") ? "E-mail ou senha inválidos." : error instanceof Error ? error.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {errorMessage ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm leading-6 text-[#9b3e3e]" role="alert">{errorMessage}</p> : null}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium" htmlFor="email">E-mail<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:ring-2 focus:ring-[#f1dce5]" id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required /></label>
        <label className="block text-sm font-medium" htmlFor="password">Senha<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:ring-2 focus:ring-[#f1dce5]" id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required /></label>
        <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white transition hover:bg-[#69344b] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={submitting}>{submitting ? "Entrando…" : "Entrar"}</button>
      </form>
    </>
  );
}

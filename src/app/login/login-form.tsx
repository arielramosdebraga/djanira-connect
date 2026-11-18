"use client";

import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const erro = useSearchParams().get("erro");
  const errorMessage = erro === "credenciais-invalidas"
    ? "E-mail ou senha inválidos."
    : erro === "sem-acesso"
      ? "Sua conta ainda não está vinculada a uma organização ativa."
      : erro === "configuracao-indisponivel"
        ? "O serviço de acesso está temporariamente indisponível."
        : erro === "preencha-os-dados"
          ? "Preencha e-mail e senha para continuar."
          : null;

  return (
    <>
      {errorMessage ? <p className="mt-6 rounded-xl bg-[#fff1f1] p-4 text-sm leading-6 text-[#9b3e3e]" role="alert">{errorMessage}</p> : null}
      <form className="mt-8 space-y-5" action="/auth/login" method="post">
        <label className="block text-sm font-medium" htmlFor="email">E-mail<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:ring-2 focus:ring-[#f1dce5]" id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required /></label>
        <label className="block text-sm font-medium" htmlFor="password">Senha<input className="mt-2 w-full rounded-xl border border-[#d9cec8] px-4 py-3 outline-none transition placeholder:text-[#a9a09a] focus:border-[#8f4e68] focus:ring-2 focus:ring-[#f1dce5]" id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required /></label>
        <button className="w-full rounded-xl bg-[#8f4e68] px-5 py-3.5 font-semibold text-white transition hover:bg-[#69344b]" type="submit">Entrar</button>
      </form>
    </>
  );
}

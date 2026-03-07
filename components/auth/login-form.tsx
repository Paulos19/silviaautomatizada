"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth.actions";
import { User, Lock, EyeOff } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="w-full flex flex-col pt-4">
      {/* Input Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-[10px] text-slate-400 font-inter uppercase tracking-[0.15em] mb-2">
          E-mail ou ID do Usuário
        </label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-400 transition-colors" />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ex: elara.vance@medica.ai"
            disabled={isPending}
            className="w-full h-12 pl-11 pr-4 bg-white/5 border border-teal-500/30 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all font-inter"
          />
        </div>
      </div>

      {/* Input Senha */}
      <div className="mb-2">
        <label htmlFor="password" className="block text-[10px] text-slate-400 font-inter uppercase tracking-[0.15em] mb-2">
          Senha
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-400 transition-colors" />
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            disabled={isPending}
            className="w-full h-12 pl-11 pr-11 bg-white/5 border border-teal-500/30 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all tracking-widest font-inter"
          />
          <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2">
            <EyeOff className="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* Esqueci a senha */}
      <div className="flex justify-end mb-6">
        <Link href="#" className="text-xs text-teal-500 font-inter hover:text-teal-400 hover:underline underline-offset-4 transition-all">
          Esqueci a senha?
        </Link>
      </div>

      {/* Erro */}
      {state?.error && (
        <div className="mb-4 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-lg text-center">
          {state.error}
        </div>
      )}

      {/* Botão Entrar */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#042F2E] font-outfit font-bold rounded-full transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]"
      >
        {isPending ? "AUTENTICANDO..." : "ENTRAR"}
      </button>
    </form>
  );
}
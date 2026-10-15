"use client";

import React, { useState, useActionState } from "react";
import { loginAction } from "@/actions/auth.actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Micro-motion variants (Premium archetype: 350-450ms, cubic-bezier(0.4, 0, 0.2, 1))
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <div className="w-full">
      <form action={formAction} className="w-full flex flex-col space-y-4">
        {/* Campo E-mail */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs sm:text-sm font-medium text-slate-700"
          >
            E-mail
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu.email@exemplo.com"
              disabled={isPending}
              defaultValue="ana@silvia.com"
              className="w-full h-10 sm:h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-xs transition-all disabled:opacity-50"
            />
          </div>
        </motion.div>

        {/* Campo Senha */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs sm:text-sm font-medium text-slate-700"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              disabled={isPending}
              className="w-full h-10 sm:h-11 pl-3.5 pr-11 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-xs transition-all disabled:opacity-50 tracking-wider"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
              aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
            >
              {showPassword ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Lembrar por 30 dias e Esqueceu a Senha */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between pt-0.5"
        >
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 cursor-pointer accent-slate-900"
            />
            <span className="text-xs sm:text-sm text-slate-600 font-normal">
              Lembrar por 30 dias
            </span>
          </label>

          <Link
            href="#"
            className="text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </motion.div>

        {/* Mensagem de Erro */}
        <AnimatePresence>
          {state?.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200/80 px-3.5 py-2.5 rounded-xl text-center"
            >
              {state.error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão de Submit: Entrar */}
        <motion.div variants={itemVariants} className="pt-1">
          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.15 }}
            className="w-full h-10 sm:h-11 bg-[#181D27] hover:bg-black text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
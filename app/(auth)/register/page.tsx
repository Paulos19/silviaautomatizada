"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { FlutedGlassShader } from "@/components/ui/FlutedGlassShader";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="relative h-screen w-screen max-h-screen overflow-hidden bg-white text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10 select-none">
      {/* Container 100vh sem scroll */}
      <div className="w-full max-w-[1240px] h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] max-h-[740px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        
        {/* ================================================================ */}
        {/* LADO ESQUERDO: Shader Canelado Sunset Puro (Sem tags)            */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, x: -16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1], // Arquétipo Premium
          }}
          className="relative w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-rose-950/10 border border-slate-200/60 hidden lg:block"
        >
          {/* WebGL Fluted Glass Shader */}
          <FlutedGlassShader
            ribCount={26}
            speed={0.38}
            className="w-full h-full"
          />
        </motion.div>

        {/* ================================================================ */}
        {/* LADO DIREITO: Formulário de Cadastro com Logo Silvia             */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.06,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="w-full max-w-[390px] mx-auto flex flex-col justify-center px-2 sm:px-4 py-2"
        >
          {/* Logo Silvia */}
          <div className="mb-5">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity mb-2">
              <img
                src="/silvia-logo.svg"
                alt="Silvia Logo"
                className="h-9 sm:h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-slate-500 font-normal font-sans">
              Crie seu acesso exclusivo ao portal hospitalar da Silvia.
            </p>
          </div>

          {/* Componente do Formulário */}
          <RegisterForm />

          {/* Link para Login */}
          <div className="text-center mt-5">
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              Já possui uma conta cadastrada?{" "}
              <Link
                href="/login"
                className="font-semibold text-slate-900 hover:underline transition-all underline-offset-2 ml-1"
              >
                Faça login
              </Link>
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
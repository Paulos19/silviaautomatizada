"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Share2, Volume2, Sparkles, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export function HeroIrisEditorial() {
  return (
    <section className="relative w-full h-screen min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10 select-none overflow-hidden">
      
      {/* ============================================================ */}
      {/* BARRA SUPERIOR: Logo Oficial Silvia e Navegação Editorial   */}
      {/* ============================================================ */}
      <div className="relative z-20 flex items-start justify-between">
        {/* Logo Silvia */}
        <div className="flex flex-col gap-1">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <img
              src="/silvia-logo.svg"
              alt="Silvia Logo"
              className="h-8 sm:h-9 w-auto"
            />
          </Link>
          <span className="font-mono text-[10px] text-slate-400 tracking-wider">
            [ HOSPITAL OTORRINOS ]
          </span>
        </div>

        {/* Links Editoriais com Flecha Diagonal */}
        <nav className="flex flex-col items-end space-y-1.5 font-mono text-xs">
          <Link
            href="#features"
            className="group flex items-center gap-1.5 text-slate-700 hover:text-slate-950 transition-colors"
          >
            <span>recursos</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          <Link
            href="#n8n-features"
            className="group flex items-center gap-1.5 text-slate-700 hover:text-slate-950 transition-colors"
          >
            <span>ecossistema</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          <Link
            href="#core"
            className="group flex items-center gap-1.5 text-slate-700 hover:text-slate-950 transition-colors"
          >
            <span>segurança</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="group flex items-center gap-1.5 font-semibold text-slate-900 hover:text-black transition-colors"
          >
            <span>acessar portal</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </nav>
      </div>

      {/* ============================================================ */}
      {/* CENTRO: Tipografia Editorial de Alto Contraste               */}
      {/* ============================================================ */}
      <div className="relative z-20 grid grid-cols-12 gap-6 items-center my-auto pointer-events-none">
        
        {/* Coluna Esquerda: Título Principal */}
        <div className="col-span-12 sm:col-span-7 lg:col-span-5 flex flex-col justify-center space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-4"
          >
            {/* Hierarquia Tipográfica: Sans Pesado + Itálico Serif + Monospace */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] font-sans">
              <span className="block">ONDE A IA</span>
              <span className="block">SE UNE</span>
              <span className="italic font-serif font-normal text-slate-700 mr-2 text-2xl sm:text-3xl lg:text-4xl">
                à sua
              </span>
              <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
                // VISÃO CLÍNICA
              </span>
            </h1>

            {/* Descrição Humanizada em Português */}
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-sm">
              Conectando a inteligência médica profunda da Silvia aos sentidos do cuidado hospitalar em tempo real no Hospital Otorrinos.
            </p>
          </motion.div>
        </div>

        {/* Coluna Direita: Marcador Editorial do Capítulo 1 */}
        <div className="hidden sm:flex col-span-5 lg:col-span-7 justify-end items-center font-mono text-xs text-slate-600">
          <div className="flex items-center gap-8">
            <span className="text-sm font-semibold tracking-wider text-slate-900">
              ( A )
            </span>
            <span className="text-xs text-slate-500 font-mono">
              [ 001 / 004 ]
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BARRA INFERIOR: Botão Pill CTA e Indicador de Rolagem        */}
      {/* ============================================================ */}
      <div className="relative z-20 flex items-center justify-between">
        {/* Controles de Som e Compartilhamento */}
        <div className="flex items-center gap-2 text-slate-500">
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-slate-300 bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-black transition-colors pointer-events-auto cursor-pointer shadow-xs"
            title="Compartilhar"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-slate-300 bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-black transition-colors pointer-events-auto cursor-pointer shadow-xs"
            title="Áudio imersivo"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Botão Pill Central */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-auto">
          <Link
            href="/login"
            className="group flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-400 bg-white/85 hover:bg-white text-slate-900 font-mono text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
            <span>AGENDAR DEMONSTRAÇÃO</span>
          </Link>
        </div>

        {/* Indicador de Rolagem para Destrançar */}
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
          <span className="hidden sm:inline">Role para destrançar</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-slate-600" />
        </div>
      </div>

    </section>
  );
}

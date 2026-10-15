"use client";

import { motion } from "framer-motion";
import { Send, Sparkles, MessageCircle } from "lucide-react";
import Link from "next/link";

export function ContactSection() {
  return (
    <section className="w-full bg-transparent py-24 px-6 md:px-12 select-none overflow-hidden">
      <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Esquerda: Informações & Contato Direto */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/60 bg-gradient-to-br from-white/90 to-amber-50/20">
          <div>
            <div className="inline-block font-mono text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              [ AGENDAMENTO DE DEMONSTRAÇÃO ]
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 leading-tight mb-4">
              Vamos transformar a rotina da sua clínica.
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 font-normal leading-relaxed mb-8">
              Converse com nossa equipe médica e tecnológica para implantar a Silvia com integração nativa ao sistema do seu hospital ou consultório.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-200/60">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-medium text-slate-700">
                Implantação assistida em menos de 48h
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>CONTATO DIRETO:</span>
              <a
                href="https://wa.me/5561986446934"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 font-bold hover:underline"
              >
                +55 (61) 98644-6934
              </a>
            </div>
          </div>
        </div>

        {/* Direita: Formulário Limpo */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white/60">
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Dra. Elara Vance"
                  className="w-full h-10.5 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="elara@clinica.com.br"
                  className="w-full h-10.5 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Especialidade ou Instituição
              </label>
              <input
                type="text"
                placeholder="Ex: Otorrinolaringologia / Hospital Otorrinos"
                className="w-full h-10.5 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Mensagem
              </label>
              <textarea
                placeholder="Conte sobre o volume de pacientes ou necessidades da agenda..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-xs resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="flex-1 h-11 rounded-xl bg-[#1E2022] hover:bg-black text-white text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Solicitar Demonstração</span>
              </button>
              <Link
                href="/login"
                className="h-11 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Portal Médico</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

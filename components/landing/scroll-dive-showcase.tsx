"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Lock, Zap, Bot, Database, ShieldCheck } from "lucide-react";

export function ScrollDiveShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [0, 1, 1, 0.4]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 overflow-hidden bg-transparent select-none"
    >
      <div className="container relative z-10 mx-auto px-6 max-w-6xl">
        <motion.div
          style={{ opacity, scale }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5 border border-amber-500/20 text-amber-700 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="inline-block font-mono text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              [ SEGURANÇA E ARQUITETURA ]
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-5 text-slate-900 font-sans leading-tight">
              A solidez do núcleo clínico.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              Segurança em nível bancário, total conformidade com a LGPD e inteligência treinada exclusivamente para dados e rotinas médicas.
            </p>
          </div>
        </motion.div>

        <motion.div
          style={{ y }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
        >
          {/* Card Principal: Silos de Dados (Span 2) */}
          <div className="col-span-1 md:col-span-2 relative p-8 sm:p-12 rounded-[2.2rem] bg-white/80 border border-slate-200/70 backdrop-blur-xl overflow-hidden shadow-[0_20px_45px_-20px_rgba(0,0,0,0.05)] group">
            <Database className="w-8 h-8 text-amber-700 mb-5" />
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-900 font-sans">
              Armazenamento Seguro e Isolado
            </h3>
            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed mb-8 max-w-lg">
              Cada consultório e especialidade médica possui um silo criptografado exclusivo. A Silvia nunca cruza prontuários ou informações privadas entre diferentes médicos.
            </p>
            <div className="w-full h-40 bg-slate-100/70 rounded-2xl border border-slate-200/60 flex items-end justify-between px-6 pb-4 overflow-hidden relative">
              {[35, 55, 40, 75, 50, 85, 65, 95, 80, 60, 90, 70].map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className="w-3 sm:w-4 rounded-t-md bg-gradient-to-t from-amber-600/60 to-amber-400 transition-all duration-500 group-hover:brightness-105"
                />
              ))}
            </div>
          </div>

          {/* Card Secundário 1: Latência Ultrabaixa (Span 1) */}
          <div className="relative p-8 rounded-[2.2rem] bg-white/85 border border-slate-200/70 backdrop-blur-xl overflow-hidden shadow-[0_20px_45px_-20px_rgba(0,0,0,0.05)] flex flex-col justify-between group">
            <div>
              <Zap className="w-8 h-8 text-amber-700 mb-5" />
              <h3 className="text-2xl font-bold mb-3 text-slate-900 font-sans">
                Respostas em &lt; 800ms
              </h3>
              <p className="text-slate-600 text-sm font-normal leading-relaxed">
                Nenhum paciente fica esperando na linha. Triagens, confirmações e dúvidas são atendidas instantaneamente com empatia natural.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>DISPONIBILIDADE</span>
              <span className="font-bold text-slate-900">99.9% UPTIME</span>
            </div>
          </div>

          {/* Card Secundário 2: Criptografia de Ponta a Ponta (Span 1) */}
          <div className="relative p-8 rounded-[2.2rem] bg-white/85 border border-slate-200/70 backdrop-blur-xl overflow-hidden shadow-[0_20px_45px_-20px_rgba(0,0,0,0.05)] flex flex-col justify-between group">
            <div>
              <Lock className="w-8 h-8 text-amber-700 mb-5" />
              <h3 className="text-2xl font-bold mb-3 text-slate-900 font-sans">
                Sigilo Hospitalar
              </h3>
              <p className="text-slate-600 text-sm font-normal leading-relaxed">
                Chaves assimétricas e canais protegidos asseguram total confidencialidade em todas as etapas da comunicação com o paciente.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>PADRÃO</span>
              <span className="font-bold text-slate-900">LGPD & CFM</span>
            </div>
          </div>

          {/* Card Secundário 3: Protocolos Otorrinolaringológicos (Span 2) */}
          <div className="col-span-1 md:col-span-2 relative p-8 sm:p-10 rounded-[2.2rem] bg-white/80 border border-slate-200/70 backdrop-blur-xl overflow-hidden shadow-[0_20px_45px_-20px_rgba(0,0,0,0.05)] group flex flex-col justify-between">
            <div>
              <Bot className="w-8 h-8 text-amber-700 mb-5" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-900 font-sans">
                RAG Clínico com Protocolos do Hospital
              </h3>
              <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
                A Silvia foi calibrada com as diretrizes específicas do Hospital Otorrinos Curitiba, compreendendo particularidades de cirurgias, exames audiológicos e consultas de rotina.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-900 font-mono">
                Regras Customizadas por Médico
              </span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-900 font-mono">
                Duração de 30min por Consulta
              </span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-900 font-mono">
                Orientação de Receitas
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

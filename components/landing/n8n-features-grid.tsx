"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ScanFace, Ear, CalendarClock, Workflow } from "lucide-react";

export function N8nFeaturesGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 overflow-hidden bg-transparent select-none"
    >
      <div className="container relative z-10 px-6 mx-auto max-w-7xl">
        {/* Título da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 mb-5 text-amber-700 border border-amber-500/20 shadow-xs">
            <Workflow className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-5 font-sans">
            Não é só um chat. <br />
            É um ecossistema clínico.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Desenvolvida sobre uma arquitetura de orquestração autônoma, a Silvia opera de ponta a ponta, conectando WhatsApp, prontuários e o sistema hospitalar em milissegundos.
          </p>
        </div>

        {/* Grade Bento Lúmina */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Card 1: Visão Computacional (Span 8) */}
          <motion.div
            style={{ y: y1 }}
            className="col-span-1 md:col-span-8 group relative bg-white/80 backdrop-blur-xl rounded-[2.2rem] p-8 md:p-12 overflow-hidden border border-slate-200/70 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-20px_rgba(245,158,11,0.1)] transition-all duration-500 min-h-[460px] flex flex-col justify-between"
          >
            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-amber-100/70 rounded-xl text-amber-800">
                  <ScanFace className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-widest text-amber-800 uppercase font-mono">
                  [ VISÃO COMPUTACIONAL ]
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 font-sans">
                Leitura instantânea de pedidos e convênios.
              </h3>
              <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
                O paciente enviou foto da carteirinha ou encaminhamento médico? A Silvia extrai o nome, código e validade automaticamente, sem retrabalho para a equipe da clínica.
              </p>
            </div>

            <div className="absolute right-0 bottom-0 w-[55%] h-[75%] md:h-full transform md:translate-x-8 translate-y-12">
              <div className="relative w-full h-full group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-700 ease-out">
                <img
                  src="/n8n_vision_ai.png"
                  alt="Interface de Visão Computacional"
                  className="absolute bottom-0 right-0 w-full h-auto object-cover rounded-tl-3xl shadow-xl border-t border-l border-white/60"
                />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Áudio e Transcrição Humanizada (Span 4) */}
          <motion.div
            style={{ y: y2 }}
            className="col-span-1 md:col-span-4 group relative bg-white/85 backdrop-blur-xl rounded-[2.2rem] p-8 md:p-10 overflow-hidden border border-slate-200/70 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-20px_rgba(245,158,11,0.1)] transition-all duration-500 min-h-[460px] flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800">
                  <Ear className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-widest text-slate-700 uppercase font-mono">
                  [ ÁUDIO NATIVO ]
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 font-sans leading-snug">
                Compreensão precisa de áudios no WhatsApp.
              </h3>
              <p className="text-slate-600 font-normal leading-relaxed text-sm">
                Pacientes frequentemente enviam mensagens de voz. A Silvia converte áudios em texto pontuado e extrai sintomas, horários e intenções com clareza clínica imediata.
              </p>
            </div>

            <div className="relative mt-6 group-hover:scale-[1.02] transition-transform duration-700 ease-out">
              <img
                src="/n8n_audio_ai.png"
                alt="Processamento de Áudio"
                className="w-full h-auto object-cover rounded-2xl shadow-lg border border-slate-200/60"
              />
            </div>
          </motion.div>

          {/* Card 3: Gestão 360 e Sincronização Hospitalar (Span 12) */}
          <motion.div
            style={{ y: y1 }}
            className="col-span-1 md:col-span-12 group relative bg-white/80 backdrop-blur-xl rounded-[2.2rem] p-8 md:p-12 overflow-hidden border border-slate-200/70 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-20px_rgba(245,158,11,0.1)] transition-all duration-500 flex flex-col md:flex-row items-center gap-10"
          >
            <div className="flex-1 relative z-10 md:pr-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-amber-100/70 rounded-xl text-amber-800">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-widest text-amber-800 uppercase font-mono">
                  [ GESTÃO AUTÔNOMA ]
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-4 font-sans">
                Sincronização direta com a agenda médica.
              </h3>
              <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed mb-6">
                Módulos integrados operam em tempo real: cadastro do paciente, conferência de convênios, verificação de slots livres e efetivação da consulta no sistema do Hospital Otorrinos sem intervenção manual.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <span className="px-3.5 py-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-700 font-mono">
                  Localização de Médicos
                </span>
                <span className="px-3.5 py-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-700 font-mono">
                  Consulta de Vagas
                </span>
                <span className="px-3.5 py-1.5 bg-slate-100/80 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-700 font-mono">
                  Efetivação de Agendamento
                </span>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <div className="relative w-full aspect-video group-hover:scale-[1.01] transition-transform duration-700 ease-out">
                <img
                  src="/n8n_scheduling_ai.png"
                  alt="Agendamento Inteligente"
                  className="w-full h-full object-cover rounded-2xl shadow-lg border border-slate-200/60"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

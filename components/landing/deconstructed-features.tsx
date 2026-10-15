"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, CalendarCheck, FileText, UserCheck } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Atendimento Humanizado",
    description:
      "Compreensão avançada de linguagem natural. A Silvia dialoga com empatia, acolhimento e absoluto rigor clínico.",
    color: "text-amber-700",
    bg: "bg-amber-100/60",
  },
  {
    icon: CalendarCheck,
    title: "Gestão de Agenda Inteligente",
    description:
      "Sincronização em tempo real com o sistema Clinic, evitando conflitos e preenchendo horários vagos automaticamente.",
    color: "text-slate-800",
    bg: "bg-slate-100/80",
  },
  {
    icon: FileText,
    title: "Triagem e Prontuários Médicos",
    description:
      "Identificação prévia de sintomas e preferências do paciente, entregando o prontuário organizado antes da consulta.",
    color: "text-amber-800",
    bg: "bg-amber-100/60",
  },
  {
    icon: UserCheck,
    title: "Cuidado e Retenção Contínua",
    description:
      "Acompanhamento pós-consulta, lembretes de retorno e comunicação acolhedora que estreita o vínculo médico-paciente.",
    color: "text-slate-800",
    bg: "bg-slate-100/80",
  },
];

export function DeconstructedFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [140, -140]);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 overflow-hidden bg-transparent select-none"
    >
      <div className="container relative z-10 px-6 mx-auto max-w-6xl">
        {/* Cabeçalho da Seção com Identidade Editorial */}
        <div className="max-w-2xl mb-20">
          <div className="inline-block font-mono text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            [ MÓDULOS DE PRECISÃO ]
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-5 font-sans">
            A desconstrução da complexidade médica.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Sistemas arcaicos substituídos por fluxos modulares e intuitivos. A Silvia atua exatamente onde o fluxo do consultório precisa de fluidez.
          </p>
        </div>

        {/* Grade de Cartões com Parallax Suave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 relative">
          {/* Coluna 1 */}
          <motion.div style={{ y: y1 }} className="flex flex-col gap-8 lg:gap-10">
            {features.slice(0, 2).map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white/75 backdrop-blur-xl border border-slate-200/70 p-8 sm:p-10 rounded-[2.2rem] shadow-[0_20px_45px_-20px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_-20px_rgba(245,158,11,0.12)] transition-all duration-500 overflow-hidden"
              >
                <div className={`w-13 h-13 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 relative z-10 shadow-xs`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10 font-sans">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base relative z-10">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Coluna 2 */}
          <motion.div style={{ y: y2 }} className="flex flex-col gap-8 lg:gap-10 mt-0 md:mt-12">
            {features.slice(2, 4).map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white/75 backdrop-blur-xl border border-slate-200/70 p-8 sm:p-10 rounded-[2.2rem] shadow-[0_20px_45px_-20px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_-20px_rgba(245,158,11,0.12)] transition-all duration-500 overflow-hidden"
              >
                <div className={`w-13 h-13 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 relative z-10 shadow-xs`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10 font-sans">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base relative z-10">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

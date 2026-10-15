"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Clock, Users, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "127+",
    label: "Especialistas Ativos",
  },
  {
    icon: ShieldCheck,
    value: "15",
    label: "Convênios Integrados",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Atendimento Contínuo",
  },
  {
    icon: Award,
    value: "100%",
    label: "Conformidade LGPD",
  },
];

export function ScrollMorphHero() {
  return (
    <section className="relative w-full bg-transparent overflow-hidden select-none py-24">
      <div className="w-full max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-widest">
            [ IMPACTO CLÍNICO COMPROVADO ]
          </span>
        </div>

        {/* Grade de Estatísticas em Cartão Lúmino com Frosted Glass */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_-15px_rgba(245,158,11,0.12)] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100/60 flex items-center justify-center mb-4 text-amber-800">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <p className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-1 font-sans">
                  {stat.value}
                </p>
                <p className="text-xs font-mono font-medium uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

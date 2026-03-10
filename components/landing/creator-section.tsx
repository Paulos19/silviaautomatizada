"use client";

import { motion } from "framer-motion";
import { Bot, CalendarCheck, Users, BarChart3 } from "lucide-react";

const features = [
    {
        icon: Bot,
        title: "Agentes IA",
        description: "Chatbots personalizados que agendam, confirmam e respondem pacientes 24 horas por dia, 7 dias por semana.",
        gradient: "from-teal-500/10 to-teal-500/5",
        border: "border-teal-500/10 hover:border-teal-500/20",
        iconColor: "text-teal-400",
    },
    {
        icon: CalendarCheck,
        title: "Agenda Inteligente",
        description: "Gestão completa de slots, lembretes automáticos e confirmações — sem retrabalho para sua equipe.",
        gradient: "from-cyan-500/10 to-cyan-500/5",
        border: "border-cyan-500/10 hover:border-cyan-500/20",
        iconColor: "text-cyan-400",
    },
    {
        icon: Users,
        title: "Gestão de Pacientes",
        description: "Prontuários, convênios e histórico centralizado. Consulte e cadastre em segundos com validação inteligente.",
        gradient: "from-blue-500/10 to-blue-500/5",
        border: "border-blue-500/10 hover:border-blue-500/20",
        iconColor: "text-blue-400",
    },
    {
        icon: BarChart3,
        title: "Analytics em Tempo Real",
        description: "Dashboards com dados reais: especialistas por área, convênios ativos e tendências para decisões estratégicas.",
        gradient: "from-violet-500/10 to-violet-500/5",
        border: "border-violet-500/10 hover:border-violet-500/20",
        iconColor: "text-violet-400",
    },
];

export function CreatorSection() {
    return (
        <section className="w-full bg-black text-white py-32 md:py-48 select-none overflow-hidden">
            <div className="w-full max-w-[1100px] mx-auto px-6 md:px-12">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-20 md:mb-28"
                >
                    <p className="text-[11px] font-inter font-medium uppercase tracking-[0.2em] text-teal-400/60 mb-6">
                        O que a Silvia faz
                    </p>
                    <h2 className="font-outfit font-extralight text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-3xl">
                        Quatro pilares para uma clínica{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                            que funciona sozinha.
                        </span>
                    </h2>
                </motion.div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className={`group relative rounded-3xl border bg-gradient-to-br p-8 md:p-10 transition-all duration-700 ${feature.gradient} ${feature.border}`}
                            >
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6 ${feature.iconColor} group-hover:scale-105 transition-transform duration-500`}>
                                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                                </div>

                                {/* Title */}
                                <h3 className="font-outfit text-xl font-medium text-white mb-3 tracking-[-0.01em]">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="font-inter text-[15px] leading-relaxed text-white/40 group-hover:text-white/55 transition-colors duration-500">
                                    {feature.description}
                                </p>

                                {/* Subtle corner glow on hover */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -mr-8 -mt-8" />
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

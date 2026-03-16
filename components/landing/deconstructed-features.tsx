"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, CalendarCheck, FileText, UserCheck } from "lucide-react";

const features = [
    {
        icon: MessageSquare,
        title: "Atendimento Humanizado",
        description: "Compreensão de linguagem natural avançada. A Silvia não parece um robô, ela dialoga com empatia e exatidão.",
        color: "text-blue-600",
        bg: "bg-blue-100/50",
    },
    {
        icon: CalendarCheck,
        title: "Gestão de Agenda Inteligente",
        description: "Sincronização em tempo real, evitando conflitos e otimizando os horários vagos de forma automática.",
        color: "text-teal-600",
        bg: "bg-teal-100/50",
    },
    {
        icon: FileText,
        title: "Triagem e Prontuários",
        description: "Coleta de informações prévias do paciente e organização automática para análise clínica rápida.",
        color: "text-indigo-600",
        bg: "bg-indigo-100/50",
    },
    {
        icon: UserCheck,
        title: "Retenção de Pacientes",
        description: "Follow-ups automáticos após consultas, lembretes de retorno e comunicação contínua.",
        color: "text-violet-600",
        bg: "bg-violet-100/50",
    },
];

export function DeconstructedFeatures() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [200, -200]);

    return (
        <section ref={containerRef} className="relative w-full py-32 overflow-hidden bg-slate-50">
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <div className="max-w-xl mb-24">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                        A desconstrução da complexidade médica.
                    </h2>
                    <p className="text-xl text-slate-500 font-light">
                        Sistemas arcaicos substituídos por fluxos modulares. A Silvia atua exatamente onde o gargalo da sua clínica acontece.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">

                    {/* Column 1 */}
                    <motion.div style={{ y: y1 }} className="flex flex-col gap-8 lg:gap-12 mt-0 md:mt-20">
                        {features.slice(0, 2).map((feature, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-white/80 backdrop-blur-xl border border-white p-8 lg:p-10 rounded-[2.5rem] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-20px_rgba(0,128,128,0.1)] transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">
                                    <feature.icon className="w-48 h-48" />
                                </div>
                                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 relative z-10`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed font-light relative z-10">{feature.description}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Column 2 */}
                    <motion.div style={{ y: y2 }} className="flex flex-col gap-8 lg:gap-12 relative z-20">
                        {features.slice(2, 4).map((feature, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-white/80 backdrop-blur-xl border border-white p-8 lg:p-10 rounded-[2.5rem] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-20px_rgba(0,128,128,0.1)] transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">
                                    <feature.icon className="w-48 h-48" />
                                </div>
                                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 relative z-10`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed font-light relative z-10">{feature.description}</p>
                            </div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

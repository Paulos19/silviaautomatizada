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
        label: "Disponibilidade",
    },
    {
        icon: Award,
        value: "LGPD",
        label: "em Conformidade",
    },
];

export function ScrollMorphHero() {
    return (
        <section className="relative w-full bg-black overflow-hidden select-none border-y border-white/[0.04]">
            <div className="w-full max-w-[1100px] mx-auto px-6 md:px-12 py-24 md:py-32">

                {/* Micro Label */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.4 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-[11px] font-inter font-medium uppercase tracking-[0.2em] text-teal-400 mb-16 text-center"
                >
                    Em números
                </motion.p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] rounded-3xl overflow-hidden">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="flex flex-col items-center justify-center text-center py-12 md:py-16 px-6 bg-black hover:bg-white/[0.02] transition-colors duration-700"
                            >
                                <Icon className="w-5 h-5 text-teal-500/40 mb-5" strokeWidth={1.5} />
                                <p className="text-3xl md:text-4xl font-outfit font-light tracking-[-0.02em] text-white mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-[11px] font-inter font-medium uppercase tracking-[0.15em] text-white/25">
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

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Lock, Zap, Bot, Database } from "lucide-react";

export function ScrollDiveShowcase() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0.5]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

    return (
        <section ref={containerRef} className="relative w-full min-h-screen py-32 overflow-hidden bg-[#09090b] text-white">
            {/* Dark Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

                {/* Glow Effects */}
                <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
            </div>

            <div className="container relative z-10 mx-auto px-6">

                <motion.div
                    style={{ opacity, scale }}
                    className="text-center max-w-4xl mx-auto mb-20"
                >
                    <div className="inline-flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6 border border-teal-500/30">
                            <Bot className="w-8 h-8 text-teal-400" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                            O mergulho no <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Núcleo</span>.
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto">
                            Segurança nível bancário, latência ultrabaixa e IA treinada exclusivamente para dados médicos.
                        </p>
                    </div>
                </motion.div>

                <motion.div style={{ y }} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">

                    <div className="col-span-1 md:col-span-2 relative p-8 md:p-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Database className="w-10 h-10 text-teal-400 mb-6" />
                        <h3 className="text-3xl font-bold mb-4">Banco de Vetores Isolado</h3>
                        <p className="text-slate-400 text-lg font-light leading-relaxed mb-8 max-w-lg">
                            Cada clínica possui um silo isolado de processamento. A Silvia nunca cruza dados entre pacientes de diferentes doutores.
                        </p>
                        <div className="w-full h-48 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative">
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-teal-500/20 to-transparent" />
                            <div className="flex gap-2 items-end h-32 px-4 w-full">
                                {[40, 60, 45, 80, 55, 90, 70, 100, 85].map((height, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${height}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="flex-1 bg-teal-500/40 rounded-t-sm"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 flex flex-col gap-6 lg:gap-8">
                        <div className="flex-1 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl group hover:border-teal-500/30 transition-colors">
                            <Lock className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-xl font-bold mb-3">LGPD & HIPAA</h3>
                            <p className="text-slate-400 text-sm font-light">Criptografia end-to-end nas mensagens de WhatsApp e proteção rigorosa de prontuários.</p>
                        </div>
                        <div className="flex-1 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl group hover:border-blue-500/30 transition-colors">
                            <Zap className="w-8 h-8 text-teal-400 mb-4" />
                            <h3 className="text-xl font-bold mb-3">Processamento Real-Time</h3>
                            <p className="text-slate-400 text-sm font-light">Integração nativa de webhooks que possibilita agendamento sem atrasos de sincronização.</p>
                        </div>
                    </div>

                </motion.div>

            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BrainCircuit, Activity } from "lucide-react";

export function HeroFuturistic() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 pb-12">
            {/* Background Grid & Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                <div className="absolute top-0 right-0 -m-32 w-[40rem] h-[40rem] rounded-full bg-teal-400/20 blur-3xl opacity-50 mix-blend-multiply" />
                <div className="absolute bottom-0 left-0 -m-32 w-[40rem] h-[40rem] rounded-full bg-blue-400/20 blur-3xl opacity-50 mix-blend-multiply" />
            </div>

            <div className="container relative z-10 px-6 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Left Content Column */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="lg:col-span-7 flex flex-col space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-50/50 backdrop-blur-md w-fit">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-medium tracking-wide text-teal-800 uppercase">Inteligência Médica de Ponta</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                            Silvia AI.
                        </span>
                        A secretária
                        <br />
                        do futuro.
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl leading-relaxed font-light">
                        Redefinindo o atendimento de clínicas e médicos independentes. Automação humanizada, gestão de agendamentos e suporte 24/7 com uma precisão que você nunca viu.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-lg overflow-hidden flex items-center justify-center gap-3"
                        >
                            <span className="relative z-10">Conhecer a Silvia</span>
                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-white/60 backdrop-blur-md border border-slate-200 text-slate-800 rounded-full font-medium text-lg hover:bg-white hover:border-slate-300 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        >
                            Ver Demonstração
                        </motion.button>
                    </div>
                </motion.div>

                {/* Right Deconstructed UI Column */}
                <div className="lg:col-span-5 relative h-[600px] hidden md:block">

                    <motion.div
                        initial={{ opacity: 0, x: 40, rotate: -5 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.2, type: "spring" }}
                        className="absolute top-10 right-0 w-80 p-6 bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] z-20"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Análise Cognitiva</h3>
                                <p className="text-sm text-slate-500">Em processamento</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "85%" }}
                                    transition={{ duration: 1.5, delay: 0.8 }}
                                    className="h-full bg-teal-500"
                                />
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "62%" }}
                                    transition={{ duration: 1.5, delay: 0.9 }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4, type: "spring" }}
                        className="absolute top-1/2 left-10 -translate-y-1/2 w-72 p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl z-30"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                            </span>
                            <span className="text-teal-400 text-sm font-medium tracking-wide">Monitoramento Ativo</span>
                        </div>
                        <div className="flex items-end justify-between border-b border-slate-700 pb-4 mb-4">
                            <div>
                                <p className="text-slate-400 text-xs uppercase mb-1">Taxa de Resposta</p>
                                <div className="text-3xl font-bold text-white">0.3s</div>
                            </div>
                            <Activity className="w-6 h-6 text-teal-500 mb-1" />
                        </div>
                        <div className="text-sm text-slate-300">
                            <span className="text-teal-400">+12%</span> mais rápido que o mês anterior
                        </div>
                    </motion.div>

                    {/* Decorative Elements */}
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -z-10" />
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 right-10 w-96 h-64 border border-slate-200/50 bg-white/30 backdrop-blur-3xl rounded-[2rem] -rotate-6 z-10"
                    />

                </div>
            </div>
        </section>
    );
}

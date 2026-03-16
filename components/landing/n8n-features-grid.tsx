"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ScanFace, Ear, CalendarClock, Workflow } from "lucide-react";

export function N8nFeaturesGrid() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const y2 = useTransform(scrollYProgress, [0, 1], [150, -150]);

    return (
        <section ref={containerRef} className="relative w-full py-32 overflow-hidden bg-white">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -m-32 w-[60rem] h-[60rem] rounded-full bg-blue-100/50 blur-[100px] opacity-60 mix-blend-multiply pointer-events-none" />
            <div className="absolute bottom-0 left-0 -m-32 w-[60rem] h-[60rem] rounded-full bg-teal-50/50 blur-[100px] opacity-60 mix-blend-multiply pointer-events-none" />

            <div className="container relative z-10 px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 mb-6 text-teal-600 border border-teal-100">
                        <Workflow className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                        Não é só um chat. <br />É um ecossistema.
                    </h2>
                    <p className="text-xl text-slate-500 font-light">
                        Desenvolvido sobre uma infraestrutura n8n de última geração, a Silvia opera como um time inteiro, realizando tarefas complexas em milissegundos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">

                    {/* Main Feature 1: Vision - Span 8 columns */}
                    <motion.div
                        style={{ y: y1 }}
                        className="col-span-1 md:col-span-8 group relative bg-[#f8fafc] rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-slate-200/60 hover:border-teal-200 hover:shadow-2xl transition-all duration-500 min-h-[500px] flex flex-col justify-between"
                    >
                        <div className="relative z-10 max-w-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-teal-100 rounded-xl text-teal-700">
                                    <ScanFace className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold tracking-widest text-teal-600 uppercase">Visão Computacional</span>
                            </div>
                            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Leitura instantânea de documentos.</h3>
                            <p className="text-slate-600 text-lg font-light leading-relaxed">
                                O paciente enviou a foto da carteirinha do convênio ou um pedido médico médico? A Silvia extrai o nome, validade e código automaticamente sem precisar perguntar nada.
                            </p>
                        </div>
                        {/* Image Parallax Container */}
                        <div className="absolute right-0 bottom-0 w-[60%] h-[80%] md:h-full transform md:translate-x-12 translate-y-20 md:translate-y-12">
                            <div className="relative w-full h-full group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-700 ease-out">
                                <img
                                    src="/n8n_vision_ai.png"
                                    alt="Vision AI Interface"
                                    className="absolute bottom-0 right-0 w-full h-auto object-cover rounded-tl-3xl shadow-[-20px_-20px_60px_-15px_rgba(0,128,128,0.2)] border-t border-l border-white/40"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Side Feature 1: Audio - Span 4 columns */}
                    <motion.div
                        style={{ y: y2 }}
                        className="col-span-1 md:col-span-4 group relative bg-slate-900 rounded-[2.5rem] p-8 md:p-10 overflow-hidden min-h-[500px] flex flex-col"
                    >
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400">
                                    <Ear className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold tracking-widest text-violet-400 uppercase">Áudio Nativo</span>
                            </div>
                            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">Gemini 2.5 Flash Transcript</h3>
                            <p className="text-slate-400 font-light leading-relaxed text-sm">
                                Pacientes adoram mandar áudios longos. A Silvia converte arquivos OGG do WhatsApp em texto perfeitamente pontuado e processa a vontade do paciente no fluxo sem falhas.
                            </p>
                        </div>
                        <div className="relative mt-8 group-hover:scale-105 transition-transform duration-700 ease-out">
                            <img
                                src="/n8n_audio_ai.png"
                                alt="Audio Parcer AI"
                                className="w-full h-auto object-cover rounded-2xl shadow-2xl border border-white/10"
                            />
                        </div>
                    </motion.div>

                    {/* Main Feature 2: Scheduling - Span 12 columns horizontally via specific bento flex */}
                    <motion.div
                        style={{ y: y1 }}
                        className="col-span-1 md:col-span-12 group relative bg-[#f1f5f9] rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-slate-200/60 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row items-center gap-12"
                    >
                        <div className="flex-1 relative z-10 md:pr-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
                                    <CalendarClock className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold tracking-widest text-blue-600 uppercase">Gestão 360º AUTÔNOMA</span>
                            </div>
                            <h3 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6">Integração impenetrável com seu ERP.</h3>
                            <p className="text-slate-600 text-lg font-light leading-relaxed mb-6">
                                Múltiplos tools n8n executando num piscar de olhos: Criação de paciente, Verificação de convênios, Consulta de slots de agenda livres e Efetivação do agendamento dentro do seu CRM sem intervenção humana.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 uppercase">Tool_Listar_Medicos</span>
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 uppercase">Tool_Buscar_Horarios</span>
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 uppercase">Tool_Agendar_Consulta</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative">
                            <div className="relative w-full aspect-video group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                                <img
                                    src="/n8n_scheduling_ai.png"
                                    alt="Autonomous Scheduling"
                                    className="w-full h-full object-cover rounded-3xl shadow-xl shadow-blue-900/10 border border-white/50"
                                />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

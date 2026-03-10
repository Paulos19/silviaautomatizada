"use client";

import { motion } from "framer-motion";
import { Send, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ContactSection() {
    return (
        <section className="w-full bg-[#FAFAFA] py-0 select-none overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh]">

                {/* ═══ Left — Image ═══ */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative h-[50vh] lg:h-auto overflow-hidden"
                >
                    <Image
                        src="/contact-zen.png"
                        alt="Silvia AI Experience"
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />

                    {/* Gradient overlay — fade to white on right edge (desktop) */}
                    <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#FAFAFA]" />

                    {/* Gradient overlay — fade to white on bottom (mobile) */}
                    <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAFAFA]" />

                    {/* Bottom-left label */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 0.7, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="absolute bottom-8 left-8 hidden lg:block"
                    >
                        <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.2em] text-zinc-400">
                            Experiência Silvia
                        </p>
                        <p className="text-lg font-outfit font-light text-zinc-600 mt-1">
                            Enhancement of human experience.
                        </p>
                    </motion.div>
                </motion.div>

                {/* ═══ Right — Form ═══ */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20 lg:py-28 bg-[#FAFAFA]"
                >
                    <div className="max-w-lg w-full mx-auto lg:mx-0">

                        {/* Header */}
                        <p className="text-[11px] font-inter font-medium uppercase tracking-[0.2em] text-teal-600/60 mb-5">
                            Fale com a Silvia
                        </p>
                        <h2 className="font-outfit font-extralight text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] text-zinc-900 mb-3">
                            Vamos construir{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
                                algo incrível.
                            </span>
                        </h2>
                        <p className="font-inter text-sm text-zinc-400 leading-relaxed mb-10 max-w-sm">
                            Preencha o formulário e nossa equipe entrará em contato para transformar a gestão da sua clínica.
                        </p>

                        {/* Form */}
                        <form className="space-y-5">

                            {/* Name + Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                        Nome
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-inter text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="clinica@example.com"
                                        className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-inter text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                    Interesse
                                </label>
                                <select className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-inter text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all appearance-none cursor-pointer">
                                    <option value="">Selecione um tema...</option>
                                    <option>Agentes IA para Atendimento</option>
                                    <option>Automação de Agendamentos</option>
                                    <option>Gestão de Prontuários</option>
                                    <option>Analytics e Dashboard</option>
                                    <option>Integração Completa</option>
                                    <option>Outro</option>
                                </select>
                            </div>

                            {/* Message */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                    Mensagem
                                </label>
                                <textarea
                                    placeholder="Conte-nos sobre os desafios da sua clínica..."
                                    rows={3}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-inter text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all resize-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 text-white text-sm font-inter font-semibold tracking-[0.02em] shadow-[0_2px_12px_rgba(13,148,136,0.15)] hover:shadow-[0_4px_20px_rgba(13,148,136,0.25)] hover:brightness-105 transition-all duration-500 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Enviar
                                </button>
                                <Link
                                    href="/login"
                                    className="flex-1 h-12 rounded-xl bg-zinc-900 text-white text-sm font-inter font-semibold tracking-[0.02em] hover:bg-zinc-800 transition-all duration-500 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Conversar com a Silvia
                                </Link>
                            </div>

                            {/* WhatsApp alt */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="w-8 h-px bg-zinc-200" />
                                <span className="text-[10px] font-inter font-medium uppercase tracking-[0.12em] text-zinc-300">ou via</span>
                                <Link
                                    href="#"
                                    className="inline-flex items-center gap-1 text-[10px] font-inter font-semibold uppercase tracking-[0.12em] text-teal-600 hover:text-teal-500 transition-colors"
                                >
                                    <MessageCircle className="w-3 h-3" /> WhatsApp
                                </Link>
                            </div>

                        </form>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}

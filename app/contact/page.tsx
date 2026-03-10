"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Send, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
    { label: "Plataforma", href: "/#features" },
    { label: "Produto", href: "/#about" },
    { label: "Contato", href: "#form" },
];

const quickLinks = [
    { label: "Demo", href: "#" },
    { label: "Preço", href: "#" },
    { label: "Outros", href: "#" },
];

export default function ContactPage() {
    const { setTheme } = useTheme();

    // Force light theme on this page
    useEffect(() => {
        setTheme("light");
        return () => setTheme("dark");
    }, [setTheme]);

    return (
        <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-teal-500/20">

            {/* ═══ Light Header ═══ */}
            <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 pointer-events-none">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-auto"
                    >
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative w-24 h-8 overflow-hidden">
                                <img
                                    src="/logo.png"
                                    alt="Silvia"
                                    className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-500 invert"
                                />
                            </div>
                        </Link>
                    </motion.div>

                    <motion.nav
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="hidden md:flex items-center gap-1 bg-zinc-950/[0.03] backdrop-blur-2xl border border-zinc-950/[0.05] px-2 py-1.5 rounded-full pointer-events-auto"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="px-5 py-1.5 rounded-full text-[11px] font-inter font-medium tracking-[0.08em] text-zinc-400 hover:text-zinc-900 hover:bg-zinc-950/[0.03] transition-all duration-500"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </motion.nav>

                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-auto"
                    >
                        <Link
                            href="/login"
                            className="px-6 py-2 rounded-full bg-zinc-950/[0.04] backdrop-blur-xl border border-zinc-950/[0.06] text-[11px] font-inter font-medium tracking-[0.08em] text-zinc-500 hover:text-zinc-900 hover:bg-zinc-950/[0.08] transition-all duration-500"
                        >
                            Acessar
                        </Link>
                    </motion.div>
                </div>
            </header>

            {/* ═══ Hero — 3D Profile ═══ */}
            <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-zinc-50/50 to-white pt-28 pb-16">

                {/* 3D Profile Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-[280px] h-[340px] md:w-[360px] md:h-[440px] mb-12"
                >
                    <Image
                        src="/silvia-profile-3d.png"
                        alt="Silvia AI"
                        fill
                        className="object-contain object-center"
                        priority
                    />
                    {/* Subtle glow under the image */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-teal-500/5 rounded-full blur-2xl" />
                </motion.div>

                {/* Vision Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-2xl px-6"
                >
                    <p className="text-[11px] font-inter font-medium uppercase tracking-[0.2em] text-teal-600/60 mb-5">
                        Visão
                    </p>
                    <h1 className="font-outfit font-extralight text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] tracking-[-0.03em] text-zinc-900 mb-4">
                        Enhancement of<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
                            human experience.
                        </span>
                    </h1>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-6 mt-6"
                >
                    <span className="text-[11px] font-inter font-medium tracking-[0.1em] text-zinc-300 uppercase">Explorar</span>
                    {quickLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-[11px] font-inter font-medium tracking-[0.1em] text-zinc-400 hover:text-zinc-900 transition-colors duration-500 uppercase"
                        >
                            {link.label}
                        </Link>
                    ))}
                </motion.div>
            </section>

            {/* ═══ Contact Form Section ═══ */}
            <section id="form" className="w-full bg-zinc-50/50 py-28 md:py-36 scroll-mt-20">
                <div className="max-w-[1100px] mx-auto px-6 md:px-12">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                        {/* Left Column — Copy */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col justify-center"
                        >
                            <p className="text-[11px] font-inter font-medium uppercase tracking-[0.2em] text-teal-600/60 mb-6">
                                Fale com a Silvia
                            </p>
                            <h2 className="font-outfit font-extralight text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em] text-zinc-900 mb-6">
                                Vamos construir<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
                                    algo incrível.
                                </span>
                            </h2>
                            <p className="font-inter text-base text-zinc-400 leading-relaxed max-w-md mb-10">
                                Preencha o formulário e nossa equipe entrará em contato para transformar a gestão da sua clínica com inteligência artificial.
                            </p>

                            {/* Feature chips */}
                            <div className="flex flex-wrap gap-2">
                                {["Agentes IA", "Agenda Smart", "Analytics", "LGPD"].map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-4 py-1.5 rounded-full bg-white border border-zinc-200/80 text-[11px] font-inter font-medium text-zinc-500 tracking-wide"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* WhatsApp option */}
                            <div className="mt-10 flex items-center gap-3">
                                <div className="w-10 h-px bg-zinc-200" />
                                <span className="text-[11px] font-inter font-medium uppercase tracking-[0.15em] text-zinc-300">ou via</span>
                                <Link
                                    href="#"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-inter font-semibold uppercase tracking-[0.15em] text-teal-600 hover:text-teal-500 transition-colors"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                </Link>
                            </div>
                        </motion.div>

                        {/* Right Column — Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <form className="bg-white rounded-3xl border border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8 md:p-10 space-y-6">

                                {/* Name + Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Seu nome"
                                            className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-inter text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                            E-mail
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="clinica@example.com"
                                            className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-inter text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                        Interesse Principal
                                    </label>
                                    <select className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 text-sm font-inter text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all appearance-none cursor-pointer">
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
                                <div className="space-y-2">
                                    <label className="text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                        Mensagem
                                    </label>
                                    <textarea
                                        placeholder="Conte-nos sobre os desafios da sua clínica..."
                                        rows={4}
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm font-inter text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 text-white text-sm font-inter font-semibold tracking-[0.02em] shadow-[0_2px_12px_rgba(13,148,136,0.2)] hover:shadow-[0_4px_20px_rgba(13,148,136,0.3)] hover:brightness-105 transition-all duration-500 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Enviar Mensagem
                                </button>

                                {/* Separator */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-zinc-100" />
                                    <span className="text-[10px] font-inter font-medium text-zinc-300 uppercase tracking-wider">ou</span>
                                    <div className="flex-1 h-px bg-zinc-100" />
                                </div>

                                {/* Chat with Silvia */}
                                <Link
                                    href="/login"
                                    className="w-full h-12 rounded-xl bg-zinc-950 text-white text-sm font-inter font-semibold tracking-[0.02em] hover:bg-zinc-800 transition-all duration-500 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Conversar com a Silvia
                                </Link>

                            </form>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ═══ Footer ═══ */}
            <footer className="w-full bg-white py-10 px-6 border-t border-zinc-100">
                <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] font-inter text-zinc-300">
                        © {new Date().getFullYear()} Silvia AI. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/" className="text-[11px] font-inter text-zinc-300 hover:text-zinc-600 transition-colors">Home</Link>
                        <Link href="#" className="text-[11px] font-inter text-zinc-300 hover:text-zinc-600 transition-colors">Privacidade</Link>
                        <Link href="#" className="text-[11px] font-inter text-zinc-300 hover:text-zinc-600 transition-colors">Termos</Link>
                    </div>
                </div>
            </footer>

        </div>
    );
}

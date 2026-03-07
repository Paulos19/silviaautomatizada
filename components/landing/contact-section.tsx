"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ContactSection() {
    return (
        <section id="contact" className="relative grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-white overflow-hidden">

            {/* Visual Column */}
            <div className="relative h-[60vh] lg:h-auto bg-zinc-100 overflow-hidden order-2 lg:order-1">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/contact-zen.png"
                        alt="Zen Medical Aesthetics"
                        fill
                        className="object-cover object-center grayscale-[20%]"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white" />

                <div className="absolute bottom-12 left-12 max-w-sm hidden lg:block">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <div className="w-12 h-px bg-zinc-900" />
                        <p className="text-sm font-outfit font-semibold uppercase tracking-widest text-zinc-500">
                            Experiência Silvia
                        </p>
                        <h2 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 leading-tight">
                            Enhancement of human experience.
                        </h2>
                    </motion.div>
                </div>
            </div>

            {/* Content/Form Column */}
            <div className="relative flex flex-col justify-center px-8 md:px-16 lg:px-24 py-32 order-1 lg:order-2 bg-white text-zinc-950">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-xl self-center lg:self-start w-full space-y-12"
                >
                    <div className="space-y-4">
                        <h3 className="text-teal-600 font-outfit font-bold uppercase tracking-[0.3em] text-xs">
                            Inicie a Orquestração
                        </h3>
                        <h1 className="text-5xl md:text-7xl font-outfit font-bold tracking-tighter text-zinc-900 leading-[0.9]">
                            Vamos<br />Conversar.
                        </h1>
                        <p className="text-lg text-zinc-500 font-inter max-w-md">
                            Preencha os detalhes e nossa equipe entrará em contato para transformar sua gestão clínica.
                        </p>
                    </div>

                    {/* Deconstructed Form */}
                    <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2 group">
                                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-focus-within:text-teal-600 transition-colors">Nome Completo</Label>
                                <Input
                                    id="name"
                                    placeholder="Sua Identidade"
                                    className="border-0 border-b border-zinc-200 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-teal-600 bg-transparent text-lg font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-focus-within:text-teal-600 transition-colors">E-mail Corporativo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="exemplo@clinica.com"
                                    className="border-0 border-b border-zinc-200 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-teal-600 bg-transparent text-lg font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-focus-within:text-teal-600 transition-colors">Interesse Principal</Label>
                            <Input
                                id="subject"
                                placeholder="Ex: Gestão AI, Automação de Agendamentos"
                                className="border-0 border-b border-zinc-200 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-teal-600 bg-transparent text-lg font-medium transition-all"
                            />
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-focus-within:text-teal-600 transition-colors">Mensagem</Label>
                            <Textarea
                                id="message"
                                placeholder="Conte-nos sobre os desafios da sua clínica..."
                                className="border-0 border-b border-zinc-200 rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-teal-600 bg-transparent text-lg font-medium min-h-[100px] resize-none transition-all"
                            />
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row gap-6 items-center">
                            <Button className="w-full sm:w-auto px-10 py-8 rounded-full bg-zinc-900 text-white hover:bg-teal-600 hover:scale-105 transition-all duration-300 font-bold text-lg group selection:bg-teal-500/30 selection:text-white">
                                Enviar Mensagem
                                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </Button>

                            <div className="flex items-center gap-3 text-zinc-400">
                                <div className="w-10 h-px bg-zinc-200" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Ou use o</span>
                                <Link href="#" className="text-teal-600 hover:text-teal-500 transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                                    WhatsApp <MessageCircle className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}

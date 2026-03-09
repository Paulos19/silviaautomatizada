"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AIInput } from "@/components/ui/ai-input";
import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "silvia";
    text: string;
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        role: "silvia",
        text: "Olá! Sou a Sílvia, sua assistente clínica. Como posso ajudar com seu agendamento hoje?",
    }
];

export function SchedulingSimulation() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addMessage = (text: string, role: "user" | "silvia") => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role,
            text,
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleUserSubmit = (value: string) => {
        addMessage(value, "user");
        setIsTyping(true);

        // Simulando a resposta da Sílvia (comportamento n8n "Respond to Webhook")
        setTimeout(() => {
            setIsTyping(false);
            const responses = [
                "Entendido. Tenho horários disponíveis para Clínica Geral amanhã às 14h ou 16h. Algum destes funciona para você?",
                "Perfeito! Vou verificar sua cobertura com o convênio agora mesmo. Só um instante...",
                "Agendamento confirmado para quarta-feira às 10h com a Dra. Ana Paula. Enviei os detalhes para o seu WhatsApp!",
            ];
            const randomResponse = responses[Math.min(messages.length / 2, responses.length - 1)];
            addMessage(randomResponse, "silvia");
        }, 1500);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <section className="w-full min-h-[700px] bg-[#09090B] py-24 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Orbes de Luz para Profundidade e Contraste */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-3xl px-6 flex flex-col items-center relative z-10">

                {/* Header da Simulação com High Contrast */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-6xl font-outfit font-bold text-white tracking-tight">
                        Experiência <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">SílviaAI</span>
                    </h2>
                    <p className="text-slate-400 font-inter max-w-lg mx-auto text-lg">
                        Simule um agendamento inteligente com alto desempenho e orquestração em tempo real.
                    </p>
                </div>

                {/* Container do Chat Estilo Glassmorphism Dark Premium */}
                <div className="w-full bg-[#121214]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_25px_80px_rgba(0,0,0,0.8)] p-6 md:p-10 flex flex-col h-[550px] relative">

                    {/* Lista de Mensagens */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto space-y-8 scroll-smooth pr-2 mb-4 scrollbar-hide"
                    >
                        <AnimatePresence initial={false}>
                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn(
                                        "flex items-end gap-4",
                                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    {/* Avatar com Gradiente */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border",
                                        m.role === "silvia"
                                            ? "bg-gradient-to-br from-primary to-primary/60 text-black border-primary/20"
                                            : "bg-zinc-800 text-zinc-400 border-white/5"
                                    )}>
                                        {m.role === "silvia" ? <Sparkles size={18} /> : <User size={18} />}
                                    </div>

                                    {/* Bolha de Mensagem */}
                                    <div className={cn(
                                        "px-6 py-4 rounded-[22px] max-w-[85%] text-[15px] font-inter leading-relaxed shadow-lg",
                                        m.role === "silvia"
                                            ? "bg-white text-zinc-900 rounded-bl-none font-medium"
                                            : "bg-teal-500/20 text-teal-100 border border-teal-500/30 rounded-br-none"
                                    )}>
                                        {m.text}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                    <div className="flex gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input com Contraste Ajustado */}
                    <div className="relative z-10">
                        <AIInput
                            onSubmit={handleUserSubmit}
                            disabled={isTyping}
                            className="bg-[#1A1A1E] border border-white/10 rounded-2xl"
                            placeholder="Descreva seu agendamento..."
                        />
                    </div>
                </div>

                {/* Badge de Tecnologia em Destaque */}
                <div className="mt-12 flex items-center gap-3 text-[11px] font-inter uppercase tracking-[0.3em] text-teal-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)] animate-pulse"></div>
                    Sílvia Orchestration Engine & n8n
                </div>
            </div>
        </section>
    );
}

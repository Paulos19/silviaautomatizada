"use client";

import { motion, Variants } from "framer-motion";
import { Activity, Users, CalendarCheck, ClockAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function AnimatedOverviewCards() {
    const cards = [
        {
            title: "Status do Sistema",
            value: "Operante",
            subtitle: "Integração n8n online",
            icon: Activity,
            color: "text-primary",
            glow: "group-hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]",
            borderColor: "group-hover:border-primary/50"
        },
        {
            title: "Pacientes Ativos",
            value: "1,204",
            subtitle: "+12% neste mês",
            icon: Users,
            color: "text-chart-2",
            glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
            borderColor: "group-hover:border-chart-2/50"
        },
        {
            title: "Consultas Hoje",
            value: "48",
            subtitle: "8 cancelamentos resolvidos",
            icon: CalendarCheck,
            color: "text-chart-3",
            glow: "group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]",
            borderColor: "group-hover:border-chart-3/50"
        },
        {
            title: "Aguardando Resposta",
            value: "5",
            subtitle: "Atendimentos via IA",
            icon: ClockAlert,
            color: "text-chart-4",
            glow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
            borderColor: "group-hover:border-chart-4/50"
        }
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            {cards.map((card, idx) => (
                <motion.div key={idx} variants={item} className="h-full">
                    <Card className={`group relative h-full bg-background/40 backdrop-blur-xl border-border/40 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${card.glow} ${card.borderColor}`}>
                        {/* Efeito de brilho de fundo no hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full bg-background/50 backdrop-blur-sm ${card.color} border border-border/30`}>
                                <card.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className={`text-3xl font-bold font-outfit ${card.color}`}>{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-2">{card.subtitle}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
}

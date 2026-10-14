"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import {
    Calendar,
    ChevronRight,
    Users,
    Stethoscope,
    ShieldCheck,
    BotMessageSquare,
    UserRound,
    Sparkles,
    Building2,
    Clock,
    Activity,
    ArrowUpRight,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { LiveWeather } from "./live-weather";
import { cn } from "@/lib/utils";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const CHART_PALETTE = [
    "#F5BE38", // Âmbar Ouro
    "#1E2022", // Grafite
    "#10B981", // Esmeralda
    "#D97706", // Ocre Quente
    "#64748B", // Slate
    "#3B82F6", // Azul Hospitalar
    "#EC4899", // Rosa
    "#8B5CF6"  // Violeta
];

interface PremiumAnalyticsProps {
    metrics: {
        activeDoctors: number;
        activeInsurances: number;
        activeAIs: number;
    };
    userName?: string;
    doctorsBySpecialty: { specialty: string; count: number }[];
    insuranceProviders: { id: number; name: string }[];
    recentPatients: { id: number; name: string }[];
    totalPatients: number;
}

function useAnimatedCounter(target: number, duration: number = 1000) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!target) return;
        let start = 0;
        const step = Math.max(1, Math.ceil(target / (duration / 16)));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setValue(target);
                clearInterval(timer);
            } else {
                setValue(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return value;
}

function CustomBarTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1E2022] text-white border border-[#3b4047] rounded-2xl px-3.5 py-2.5 shadow-xl text-xs">
            <p className="text-slate-300 font-medium mb-0.5">{label}</p>
            <p className="text-sm font-bold text-amber-400">
                {payload[0].value} <span className="text-[11px] font-normal text-slate-300">médicos credenciados</span>
            </p>
        </div>
    );
}

export function PremiumAnalytics({
    metrics,
    userName = "Visitante",
    doctorsBySpecialty,
    insuranceProviders,
    recentPatients,
    totalPatients
}: PremiumAnalyticsProps) {
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                })
            );
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const animDoctors = useAnimatedCounter(metrics.activeDoctors || 15);
    const animInsurances = useAnimatedCounter(insuranceProviders.length || metrics.activeInsurances || 14);
    const animPatients = useAnimatedCounter(totalPatients || 1420);

    // Formatação de especialidades para o gráfico
    const chartData = doctorsBySpecialty.length > 0 ? doctorsBySpecialty : [
        { specialty: "Otorrinolaringologia", count: 8 },
        { specialty: "Cirurgia Cérvico-Facial", count: 3 },
        { specialty: "Rinologia & Seios da Face", count: 2 },
        { specialty: "Otoneurologia & Labirinto", count: 2 },
        { specialty: "Fonoaudiologia Clínica", count: 4 }
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full space-y-8 pb-16"
        >
            {/* Header da Visão Geral */}
            <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#E8E2D6]/70">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
                            Hospital Otorrinos Curitiba
                        </span>
                        <span className="text-xs text-slate-700 capitalize">
                            • {currentTime || "Quarta-feira, Curitiba"}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
                        Visão Geral, <span className="font-semibold text-slate-900">{userName}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/orchestrator"
                        className="px-4 py-2 rounded-2xl bg-[#1E2022] hover:bg-black text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
                    >
                        <Activity className="w-4 h-4 text-amber-400" />
                        <span>Abrir Orquestrador Silvia</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                </div>
            </motion.div>

            {/* Bento Grid: 4 Cards Principais de Métricas */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Corpo Clínico */}
                <div className="p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between group hover:border-amber-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Corpo Clínico</span>
                        <div className="w-9 h-9 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-slate-800 group-hover:bg-amber-100 transition-colors">
                            <Stethoscope className="w-4 h-4 text-slate-800" />
                        </div>
                    </div>
                    <div className="my-3">
                        <span className="text-3xl font-light text-slate-900 tracking-tight">
                            {animDoctors}
                        </span>
                        <span className="text-xs text-slate-700 ml-1.5 font-normal">especialistas ativos</span>
                    </div>
                    <Link href="/dashboard/doctors" className="pt-2 border-t border-[#F0EAE0] text-[11px] text-amber-800 font-semibold flex items-center justify-between group-hover:translate-x-0.5 transition-transform">
                        <span>Ver lista completa</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Card 2: Convênios */}
                <div className="p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between group hover:border-amber-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Convênios Credenciados</span>
                        <div className="w-9 h-9 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-slate-800 group-hover:bg-amber-100 transition-colors">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <div className="my-3">
                        <span className="text-3xl font-light text-slate-900 tracking-tight">
                            {animInsurances}
                        </span>
                        <span className="text-xs text-slate-700 ml-1.5 font-normal">planos de saúde</span>
                    </div>
                    <div className="pt-2 border-t border-[#F0EAE0] text-[11px] text-slate-700 flex items-center justify-between">
                        <span>Unimed, Bradesco, Amil...</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                </div>

                {/* Card 3: Pacientes */}
                <div className="p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between group hover:border-amber-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Pacientes da Clínica</span>
                        <div className="w-9 h-9 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-slate-800 group-hover:bg-amber-100 transition-colors">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <div className="my-3">
                        <span className="text-3xl font-light text-slate-900 tracking-tight">
                            {animPatients}
                        </span>
                        <span className="text-xs text-slate-700 ml-1.5 font-normal">registrados</span>
                    </div>
                    <Link href="/dashboard/patients" className="pt-2 border-t border-[#F0EAE0] text-[11px] text-amber-800 font-semibold flex items-center justify-between group-hover:translate-x-0.5 transition-transform">
                        <span>Buscar e Cadastrar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Card 4: Silvia IA Concierge */}
                <div className="p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between group hover:border-amber-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Silvia Concierge</span>
                        <div className="w-9 h-9 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-slate-800 group-hover:bg-amber-100 transition-colors">
                            <BotMessageSquare className="w-4 h-4 text-amber-600" />
                        </div>
                    </div>
                    <div className="my-3 flex items-center gap-3">
                        <img
                            src="/silvia-avatar-warm.jpg"
                            alt="Silvia"
                            className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">24/7 Operacional</span>
                            <span className="text-[11px] text-emerald-800 flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                SLA 120ms • Live
                            </span>
                        </div>
                    </div>
                    <Link href="/dashboard/orchestrator" className="pt-2 border-t border-[#F0EAE0] text-[11px] text-amber-800 font-semibold flex items-center justify-between group-hover:translate-x-0.5 transition-transform">
                        <span>Ver Conversas ao Vivo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </motion.div>

            {/* Bento Grid: Seção Gráfica e Convênios */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Gráfico de Especialidades (8 cols) */}
                <motion.div variants={item} className="lg:col-span-8 p-6 rounded-[36px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-amber-600" />
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    Corpo Clínico por Especialidade • Hospital Otorrinos
                                </h3>
                            </div>
                            <span className="text-xs text-slate-700 font-mono">
                                {chartData.length} áreas mapeadas
                            </span>
                        </div>

                        <div className="h-[280px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <XAxis
                                        dataKey="specialty"
                                        tick={{ fill: "#64748B", fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#E8E2D6" }}
                                        interval={0}
                                        angle={-15}
                                        textAnchor="end"
                                    />
                                    <YAxis
                                        tick={{ fill: "#64748B", fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#E8E2D6" }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0EAE0] flex items-center justify-between text-xs text-slate-700">
                        <span>Hospital Otorrinos Curitiba • Especialistas Qualificados</span>
                        <Link href="/dashboard/doctors" className="font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1">
                            Gerenciar Médicos <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </motion.div>

                {/* Convênios Aceitos (4 cols) */}
                <motion.div variants={item} className="lg:col-span-4 p-6 rounded-[36px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    Convênios Credenciados
                                </h3>
                            </div>
                            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                100% Ativos
                            </span>
                        </div>

                        <div className="space-y-2 mt-4 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                            {(insuranceProviders.length > 0 ? insuranceProviders : [
                                { id: 1, name: "UNIMED CURITIBA" },
                                { id: 2, name: "BRADESCO SAÚDE" },
                                { id: 3, name: "AMIL ASSISTÊNCIA MÉDICA" },
                                { id: 4, name: "SULAMÉRICA SAÚDE" },
                                { id: 5, name: "NOTRE DAME INTERMÉDICA" },
                                { id: 6, name: "PARTICULAR / DIRETO" },
                                { id: 7, name: "COPEL / SANEPAR" }
                            ]).map((ins) => (
                                <div key={ins.id} className="p-2.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-800">{ins.name}</span>
                                    <span className="text-[10px] font-mono text-emerald-800 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Ativo
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0EAE0] text-xs text-slate-700 flex items-center justify-between">
                        <span>Integração Clinic API</span>
                        <span className="text-[11px] font-mono text-slate-700">Curitiba/PR</span>
                    </div>
                </motion.div>
            </div>

            {/* Bento Grid: Pacientes Recentes & Clima Local Curitiba */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Pacientes Recentes (8 cols) */}
                <motion.div variants={item} className="lg:col-span-8 p-6 rounded-[36px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    Pacientes Recentes Atendidos pela Silvia
                                </h3>
                            </div>
                            <Link href="/dashboard/patients" className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1">
                                Ver Todos <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="mt-4 divide-y divide-[#F0EAE0]">
                            {(recentPatients.length > 0 ? recentPatients : [
                                { id: 1, name: "Maria Luiza do Amaral Fortunato" },
                                { id: 2, name: "Patricia Bonato" },
                                { id: 3, name: "Sirlei Camargo" },
                                { id: 4, name: "Taciane Kunze" },
                                { id: 5, name: "Paula Castro" }
                            ]).map((pt) => (
                                <div key={pt.id} className="py-3 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs">
                                            {pt.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{pt.name}</p>
                                            <p className="text-[10px] text-slate-700">Atendimento via WhatsApp • Silvia Concierge</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                                        Ativo Hoje
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0EAE0] text-xs text-slate-700 flex items-center justify-between">
                        <span>Sincronização em tempo real</span>
                        <Link href="/dashboard/bookings" className="text-amber-800 font-semibold hover:underline">
                            Agendar nova consulta
                        </Link>
                    </div>
                </motion.div>

                {/* Clima & Hospital Otorrinos (4 cols) */}
                <motion.div variants={item} className="lg:col-span-4 p-6 rounded-[36px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-amber-600" />
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    Unidade Hospitalar
                                </h3>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-800 bg-[#F4EFE6] px-2 py-0.5 rounded-full">
                                Curitiba, PR
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] space-y-1">
                                <span className="text-xs font-semibold text-slate-900">Hospital Otorrinos Curitiba</span>
                                <p className="text-[11px] text-slate-700 leading-relaxed">
                                    Atendimento especializado em Otorrinolaringologia, Audiologia, Fonoaudiologia e Cirurgias da Face.
                                </p>
                            </div>

                            {/* Widget do Clima Local */}
                            <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6]">
                                <LiveWeather />
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0EAE0] text-[11px] text-slate-700 flex items-center justify-between">
                        <span>Central Silvia: (41) 9119-4738</span>
                        <span className="font-semibold text-emerald-800">Online</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

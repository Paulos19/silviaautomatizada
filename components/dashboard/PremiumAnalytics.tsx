"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell, PieChart, Pie,
} from "recharts";
import { Calendar, ChevronRight, Search, Bell, Menu, Users, Stethoscope, ShieldCheck, BotMessageSquare, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LiveWeather } from "./live-weather";
import { Variants } from "framer-motion";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Color palette for charts
const CHART_COLORS = [
    "#14B8A6", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444",
    "#06B6D4", "#10B981", "#6366F1", "#EC4899", "#F97316",
    "#84CC16", "#22D3EE", "#A78BFA", "#FB923C", "#34D399",
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

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (target === 0) return;
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

// Custom tooltip for bar chart
function CustomBarTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0B121D]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl shadow-black/30">
            <p className="text-xs text-slate-400 font-inter mb-1">{label}</p>
            <p className="text-lg font-outfit font-semibold text-white">
                {payload[0].value} <span className="text-xs text-teal-400 font-normal">médico{payload[0].value !== 1 ? 's' : ''}</span>
            </p>
        </div>
    );
}

// Custom tooltip for pie chart
function CustomPieTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0B121D]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl shadow-black/30">
            <p className="text-sm font-outfit font-medium text-white">{payload[0].name}</p>
        </div>
    );
}

export function PremiumAnalytics({
    metrics,
    userName = "Visitante",
    doctorsBySpecialty,
    insuranceProviders,
    recentPatients,
    totalPatients,
}: PremiumAnalyticsProps) {
    const [time, setTime] = useState<Date | null>(null);

    // Animated counters
    const animDoctors = useAnimatedCounter(metrics.activeDoctors);
    const animInsurances = useAnimatedCounter(metrics.activeInsurances);
    const animAIs = useAnimatedCounter(metrics.activeAIs);
    const animPatients = useAnimatedCounter(totalPatients);

    useEffect(() => {
        setTime(new Date());
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedTime = time?.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    const seconds = time?.getSeconds().toString().padStart(2, '0');
    const formattedDate = time?.toLocaleDateString("pt-BR", { weekday: 'short', day: 'numeric', month: 'short' });

    const getGreeting = () => {
        const currentHour = time ? time.getHours() : new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) return "Bom dia";
        if (currentHour >= 12 && currentHour < 18) return "Boa tarde";
        return "Boa noite";
    };

    // Prepare pie chart data for insurances
    const pieData = insuranceProviders.slice(0, 10).map((ins, i) => ({
        name: ins.name,
        value: 1,
        fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

    // Max count for specialty bars (for relative sizing in the custom bar chart)
    const maxSpecCount = Math.max(...doctorsBySpecialty.map(d => d.count), 1);

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-8 text-slate-200">

            {/* HEADER */}
            <motion.div variants={item} className="w-full flex items-center justify-between h-20 bg-[#0B121D]/40 backdrop-blur-2xl border border-white/5 rounded-3xl px-6 group hover:border-teal-500/20 transition-all duration-500 shadow-sm">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden shrink-0 hover:bg-white/5">
                        <Menu className="w-6 h-6 text-slate-300" />
                    </Button>
                    <div className="hidden lg:flex relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/search:text-teal-400 transition-colors z-10" />
                        <Input
                            placeholder="Buscar..."
                            className="w-48 xl:w-80 pl-10 bg-white/5 border border-white/5 text-slate-200 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-teal-500/50 focus-visible:bg-[#0B121D] focus-visible:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all rounded-full h-10"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden sm:block">
                        <LiveWeather />
                    </div>
                    <div className="flex flex-col items-end min-w-[70px]">
                        <div className="flex items-baseline font-outfit text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]">
                            <span className="text-xl md:text-3xl font-bold tracking-tighter">{formattedTime || "00:00"}</span>
                            <span className="text-xs md:text-sm font-medium text-slate-500 ml-0.5 animate-pulse">:{seconds || "00"}</span>
                        </div>
                        <span className="text-[10px] md:text-xs font-medium font-inter text-slate-400 capitalize whitespace-nowrap">
                            {formattedDate || "..."}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full shrink-0 h-10 w-10 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                        <Bell className="w-5 h-5 text-slate-300" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    </Button>
                </div>
            </motion.div>

            {/* GREETING */}
            <motion.div variants={item} className="flex justify-between items-end pl-2">
                <div>
                    <h1 className="text-4xl font-outfit font-semibold text-white tracking-tight">{getGreeting()}, {userName}</h1>
                    <p className="text-sm font-inter text-slate-400 mt-2">AI-powered medical platform</p>
                </div>
            </motion.div>

            {/* TOP 4 METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Corpo Clínico */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-teal-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center z-10 mb-4">
                        <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                            <Stethoscope className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="bg-teal-500/15 text-teal-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                            Online
                        </div>
                    </div>
                    <span className="text-3xl font-outfit font-bold text-white z-10">{animDoctors}</span>
                    <p className="text-xs text-slate-500 font-inter mt-1 z-10">Especialistas Ativos</p>
                </motion.div>

                {/* Card 2: Planos de Saúde */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center z-10 mb-4">
                        <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-3xl font-outfit font-bold text-white z-10">{animInsurances}</span>
                    <p className="text-xs text-slate-500 font-inter mt-1 z-10">Convênios Operantes</p>
                </motion.div>

                {/* Card 3: Agentes de IA */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center z-10 mb-4">
                        <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                            <BotMessageSquare className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="bg-white/5 text-slate-300 text-[10px] px-2.5 py-1 rounded-full border border-white/10">Sincr. Hoje</div>
                    </div>
                    <span className="text-3xl font-outfit font-bold text-white z-10">{animAIs}</span>
                    <p className="text-xs text-slate-500 font-inter mt-1 z-10">Agentes Configurados</p>
                </motion.div>

                {/* Card 4: Total Pacientes */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center z-10 mb-4">
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <Users className="w-5 h-5 text-amber-400" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-3xl font-outfit font-bold text-white z-10">{animPatients}</span>
                    <p className="text-xs text-slate-500 font-inter mt-1 z-10">Pacientes Cadastrados</p>
                </motion.div>
            </div>

            {/* CHART ROW: Specialties + Insurance Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* BIG CHART: Médicos por Especialidade */}
                <motion.div variants={item} className="lg:col-span-3 bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-8 flex flex-col group hover:border-teal-500/20 transition-all duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-outfit text-lg font-medium text-white">Médicos por Especialidade</h3>
                            <p className="text-xs text-slate-500 font-inter mt-1">Distribuição do corpo clínico ativo</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                            {metrics.activeDoctors} total
                        </div>
                    </div>

                    {doctorsBySpecialty.length > 0 ? (
                        <div className="flex-1 w-full min-h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={doctorsBySpecialty.slice(0, 12)}
                                    layout="vertical"
                                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                                    barCategoryGap="20%"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                                    <XAxis
                                        type="number"
                                        stroke="#475569"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="specialty"
                                        stroke="#64748B"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        width={140}
                                        tick={{ fill: '#94A3B8' }}
                                    />
                                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(20,184,166,0.05)', radius: 8 }} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <Bar
                                        dataKey="count"
                                        fill="url(#barGradient)"
                                        radius={[0, 8, 8, 0]}
                                        maxBarSize={28}
                                        style={{ filter: 'drop-shadow(0px 0px 6px rgba(20,184,166,0.3))' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-inter">
                            Nenhum dado de especialidade disponível
                        </div>
                    )}
                </motion.div>

                {/* SIDEBAR: Convênios Ativos */}
                <motion.div variants={item} className="lg:col-span-2 bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-8 flex flex-col group hover:border-blue-500/20 transition-all duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-outfit text-lg font-medium text-white">Convênios Ativos</h3>
                            <p className="text-xs text-slate-500 font-inter mt-1">{insuranceProviders.length} planos integrados</p>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                        </div>
                    </div>

                    {insuranceProviders.length > 0 ? (
                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                            {insuranceProviders.slice(0, 12).map((ins, i) => (
                                <motion.div
                                    key={ins.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 bg-[#0B121D]/60 border border-white/5 rounded-2xl px-4 py-3 group/item hover:bg-white/5 hover:border-white/10 transition-all cursor-default"
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                            boxShadow: `0 0 8px ${CHART_COLORS[i % CHART_COLORS.length]}80`,
                                        }}
                                    />
                                    <span className="text-sm text-slate-300 font-inter truncate flex-1">{ins.name}</span>
                                    <span className="text-[10px] text-slate-600 font-mono">#{ins.id}</span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-inter">
                            Nenhum convênio disponível
                        </div>
                    )}
                </motion.div>
            </div>

            {/* BOTTOM ROW: Recent Patients */}
            <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-8 group hover:border-amber-500/20 transition-all duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-outfit text-lg font-medium text-white">Pacientes Recentes</h3>
                        <p className="text-xs text-slate-500 font-inter mt-1">Últimos pacientes cadastrados na plataforma</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-inter flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            {totalPatients} total
                        </div>
                    </div>
                </div>

                {recentPatients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {recentPatients.map((patient, i) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 bg-[#0B121D]/60 border border-white/5 rounded-2xl px-4 py-3 group/card hover:bg-white/5 hover:border-amber-500/20 transition-all cursor-default"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                    <UserRound className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-white font-inter truncate">{patient.name}</p>
                                    <p className="text-[10px] text-slate-600 font-mono">ID {patient.id}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 flex items-center justify-center text-slate-500 text-sm font-inter">
                        Nenhum paciente encontrado
                    </div>
                )}
            </motion.div>

        </motion.div>
    );
}

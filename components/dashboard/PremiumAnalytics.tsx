"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Calendar, ChevronRight, Star, Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LiveWeather } from "./live-weather";

// Dados Fictícios
const patientData = [
    { day: "0", value: 30 }, { day: "1", value: 45 }, { day: "2", value: 40 },
    { day: "3", value: 65 }, { day: "4", value: 60 }, { day: "5", value: 85 }
];

const accuracyData = [
    { day: "0", value: 50 }, { day: "1", value: 60 }, { day: "2", value: 55 },
    { day: "3", value: 80 }, { day: "4", value: 75 }, { day: "5", value: 95 }
];

const vitalsData = [
    { name: 'Oct 20-26', hr: 60, bp: 90, temp: 30 },
    { name: 'Mon', hr: 75, bp: 100, temp: 45 },
    { name: 'Tue', hr: 65, bp: 130, temp: 40 },
    { name: 'Wed', hr: 110, bp: 95, temp: 65 },
    { name: 'Thu', hr: 90, bp: 80, temp: 50 },
    { name: 'Fri', hr: 120, bp: 85, temp: 55 },
    { name: 'Oct 20-26', hr: 115, bp: 90, temp: 50 },
];

import { Variants } from "framer-motion";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface PremiumAnalyticsProps {
    metrics: {
        activeDoctors: number;
        activeInsurances: number;
        activeAIs: number;
    };
    userName?: string;
}

export function PremiumAnalytics({ metrics, userName = "Visitante" }: PremiumAnalyticsProps) {
    const [time, setTime] = useState<Date | null>(null);

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

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-6 text-slate-200">

            {/* HEADER INTEGRADO */}
            <motion.div variants={item} className="w-full flex items-center justify-between h-20 bg-[#0B121D]/40 backdrop-blur-2xl border border-white/5 rounded-3xl px-6 mb-8 group hover:border-teal-500/20 transition-all duration-500 shadow-sm">

                {/* Search Bar & Mobile Menu */}
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

                {/* Relógio, Clima e Notificações */}
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

            {/* LINHA 1: Welcome Message */}
            <motion.div variants={item} className="flex justify-between items-end mb-8 pl-2">
                <div>
                    <h1 className="text-4xl font-outfit font-semibold text-white tracking-tight">{getGreeting()}, {userName}</h1>
                    <p className="text-sm font-inter text-slate-400 mt-2">AI-powered medical platform</p>
                </div>
            </motion.div>

            {/* LINHA 2: Top 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-44 mb-8">
                {/* Card 1: Patient Overview */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-5 flex flex-col relative overflow-hidden group hover:border-teal-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center z-10">
                        <h3 className="font-inter text-sm font-medium text-slate-300">Corpo Clínico</h3>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex justify-between items-end mt-2 z-10">
                        <div>
                            <span className="text-4xl font-outfit font-semibold text-white">{metrics.activeDoctors}</span>
                            <p className="text-xs text-slate-500 font-inter mt-1">Especialistas Ativos</p>
                        </div>
                        <div className="bg-teal-500/20 text-teal-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center mb-5">
                            Online
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 z-0 mix-blend-screen">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={patientData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#2DD4BF" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Card 2: AI Predictions */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-5 flex flex-col relative overflow-hidden group hover:border-[#3B82F6]/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center z-10">
                        <h3 className="font-inter text-sm font-medium text-slate-300">Planos de Saúde</h3>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="mt-2 z-10">
                        <span className="text-4xl font-outfit font-semibold text-white">{metrics.activeInsurances}</span>
                        <p className="text-xs text-slate-500 font-inter mt-1">Convênios Operantes</p>
                    </div>
                    <div className="absolute bottom-3 left-0 right-0 h-20 z-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={accuracyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={false} style={{ filter: 'drop-shadow(0px 0px 8px rgba(59, 130, 246, 0.6))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Card 3: Upcoming Appointments */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-5 flex flex-col group hover:border-slate-500/30 transition-all duration-300">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-inter text-sm font-medium text-slate-300">Agentes de IA</h3>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <span className="text-4xl font-outfit font-semibold text-white">{metrics.activeAIs}</span>
                        <div className="bg-white/5 text-slate-300 text-xs px-2 py-1 rounded-md border border-white/10">Sincr. Hoje</div>
                    </div>
                    <div className="space-y-2 flex-1 overflow-hidden">
                        {[
                            { name: "James Noris", time: "3:00 AM" },
                            { name: "Elara Vance", time: "9:00 AM" },
                            { name: "Clara Vancin", time: "Consults" }
                        ].map((pt, i) => (
                            <div key={i} className="flex justify-between items-center text-sm font-inter">
                                <span className="text-slate-400">{pt.name}</span>
                                <span className="text-slate-500">{pt.time}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* LINHA 3: Master Chart & Predictive Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px] mb-8">
                {/* BIG CHART */}
                <motion.div variants={item} className="lg:col-span-2 bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-5 md:p-6 flex flex-col group hover:border-teal-500/20 transition-all duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-outfit text-lg font-medium text-white">AI Health Diagnostics</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs font-inter text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-[#14B8A6] shadow-[0_0_8px_#14B8A6]"></span> HR
                                <span className="w-2 h-2 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6] ml-2"></span> BP
                                <span className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366F1] ml-2"></span> Temp
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 cursor-pointer hover:bg-white/10 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Consults ˅
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vitalsData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dx={-10} ticks={[0, 30, 60, 90, 120, 140]} />
                                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px' }} />

                                <Line type="monotone" dataKey="hr" stroke="#14B8A6" strokeWidth={3} dot={{ stroke: '#14B8A6', strokeWidth: 2, fill: '#0F172A', r: 5 }} activeDot={{ r: 7 }} style={{ filter: 'drop-shadow(0px 0px 8px rgba(20, 184, 166, 0.4))' }} />
                                <Line type="monotone" dataKey="bp" stroke="#3B82F6" strokeWidth={3} dot={{ stroke: '#3B82F6', strokeWidth: 2, fill: '#0F172A', r: 5 }} activeDot={{ r: 7 }} style={{ filter: 'drop-shadow(0px 0px 8px rgba(59, 130, 246, 0.4))' }} />
                                <Line type="monotone" dataKey="temp" stroke="#6366F1" strokeWidth={3} dot={{ stroke: '#6366F1', strokeWidth: 2, fill: '#0F172A', r: 5 }} activeDot={{ r: 7 }} style={{ filter: 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.4))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Predictive Analysis List */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 flex flex-col group hover:border-[#8B5CF6]/30 transition-all duration-300">
                    <h3 className="font-inter text-sm font-medium text-slate-300 mb-5">Predictive Analysis</h3>
                    <div className="flex flex-col gap-3 flex-1">
                        {[
                            { id: "341A", risk: "Low", color: "bg-teal-500", glow: "shadow-[0_0_10px_rgba(20,184,166,0.5)]" },
                            { id: "341B", risk: "Low", color: "bg-amber-500", glow: "shadow-[0_0_10px_rgba(245,158,11,0.5)]" },
                            { id: "342A", risk: "Low", color: "bg-teal-500", glow: "shadow-[0_0_10px_rgba(20,184,166,0.5)]" },
                            { id: "345E", risk: "Low", color: "bg-teal-500", glow: "shadow-[0_0_10px_rgba(20,184,166,0.5)]" }
                        ].map((p, i) => (
                            <div key={i} className="flex justify-between items-center bg-[#0B121D] border border-white/5 rounded-2xl p-4 relative overflow-hidden group/card hover:bg-white/5 cursor-pointer transition-colors">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.color} ${p.glow}`} />
                                <div>
                                    <h4 className="text-white text-sm font-outfit">Patient ID: {p.id}</h4>
                                    <p className="text-xs text-slate-500 font-inter mt-0.5">Risk: <span className="text-teal-400">{p.risk}</span></p>
                                </div>
                                <div className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 group-hover/card:bg-teal-500/20 transition-all">
                                    Status um <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* LINHA 4: Bottom Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-32 pt-2">
                {/* Feedback */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-teal-500/30 transition-all">
                    <div className="flex justify-between items-center">
                        <h3 className="font-inter text-base font-medium text-slate-300">Patient Feedback</h3>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <span className="text-4xl font-outfit font-semibold text-white">4.9<span className="text-xl text-slate-500">/5</span></span>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={`w-6 h-6 ${i === 5 ? 'text-teal-500/40' : 'text-teal-400 fill-teal-400'} drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]`} />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Active Tasks */}
                <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-[#3B82F6]/30 transition-all">
                    <h3 className="font-inter text-base font-medium text-slate-300 mb-4">Active Tasks</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Progress</span></div>
                                <div className="w-full bg-[#0B1521] h-1.5 rounded-full overflow-hidden border border-white/5">
                                    <div className="bg-teal-400 w-[60%] h-full rounded-full shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Progress</span></div>
                                <div className="w-full bg-[#0B1521] h-1.5 rounded-full overflow-hidden border border-white/5">
                                    <div className="bg-blue-500 w-[85%] h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

        </motion.div>
    );
}

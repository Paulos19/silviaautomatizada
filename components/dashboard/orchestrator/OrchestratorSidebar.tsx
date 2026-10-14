"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    MessageSquare,
    CalendarDays,
    Users,
    Stethoscope,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    Radio,
    Sparkles,
    ShieldCheck,
    Cpu,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrchestratorSidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    wsConnected?: boolean;
}

export function OrchestratorSidebar({
    isOpen,
    setIsOpen,
    wsConnected = true
}: OrchestratorSidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { icon: Activity, label: "Orquestrador Silv.IA", href: "/dashboard/orchestrator" },
        { icon: CalendarDays, label: "Agendamentos", href: "/dashboard/bookings" },
        { icon: Users, label: "Pacientes", href: "/dashboard/patients" },
        { icon: Stethoscope, label: "Corpo Clínico", href: "/dashboard/doctors" },
        { icon: FileText, label: "Receitas", href: "/dashboard/prescriptions" },
        { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
    ];

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 md:relative h-screen bg-[#FBF9F4]/90 backdrop-blur-2xl border-r border-[#E8E2D6] flex flex-col transition-all duration-400 ease-out z-50 overflow-hidden select-none",
                isOpen ? "translate-x-0 w-[270px]" : "-translate-x-full md:translate-x-0 md:w-[78px]"
            )}
        >
            {/* Botão de Retração / Expansão */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-white border border-[#E0D8C8] shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#F7F3EA] text-slate-700 hidden md:flex items-center justify-center z-50 transition-transform duration-200 hover:scale-105"
                title={isOpen ? "Recolher barra lateral" : "Expandir barra lateral"}
            >
                {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {/* Topo / Logo da Silv.IA & Hospital Otorrinos */}
            <div className="p-5 pb-4 border-b border-[#E8E2D6]/70 flex items-center justify-between">
                <Link href="/dashboard/orchestrator" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E2022] to-[#2E3238] flex items-center justify-center text-white font-bold shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-black/10 group-hover:scale-105 transition-transform duration-200">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    {isOpen && (
                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                                Silv.IA
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60">
                                    v2.4
                                </span>
                            </span>
                            <span className="text-[11px] text-slate-700">Hospital Otorrinos</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Status Live Indicator Badge */}
            {isOpen && (
                <div className="mx-4 mt-4 p-3 rounded-2xl bg-white border border-[#E8E2D6] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                            {wsConnected && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            )}
                            <span
                                className={cn(
                                    "relative inline-flex rounded-full h-2.5 w-2.5",
                                    wsConnected ? "bg-emerald-500" : "bg-rose-500"
                                )}
                            />
                        </span>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-slate-800">
                                {wsConnected ? "WebSocket Conectado" : "Conexão Offline"}
                            </span>
                            <span className="text-[10px] text-slate-700">Fluxo em Tempo Real</span>
                        </div>
                    </div>
                    <Radio className={cn("w-3.5 h-3.5", wsConnected ? "text-emerald-600 animate-pulse" : "text-rose-500")} />
                </div>
            )}

            {/* Links de Navegação */}
            <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium text-xs transition-all duration-200 group relative",
                                isActive
                                    ? "bg-[#1E2022] text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] font-semibold"
                                    : "text-slate-700 hover:text-slate-900 hover:bg-[#F2ECE0]/70"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                                    isActive ? "text-amber-400" : "text-slate-700 group-hover:text-slate-700"
                                )}
                            />
                            {isOpen && <span>{item.label}</span>}
                            {isOpen && isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Informações da Instância e Conexões (Rodapé) */}
            {isOpen && (
                <div className="p-4 mx-3 mb-4 rounded-2xl bg-white border border-[#E8E2D6] shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                        <span className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-amber-600" />
                            Instância Oficial
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Silvia
                        </span>
                    </div>
                    <div className="text-[10px] text-slate-700 font-mono flex items-center justify-between">
                        <span>WhatsApp:</span>
                        <span className="font-semibold text-slate-700">(41) 9119-4738</span>
                    </div>
                    <div className="text-[10px] text-slate-700 font-mono flex items-center justify-between">
                        <span>Clinic API:</span>
                        <span className="font-semibold text-slate-700">Facility #1</span>
                    </div>
                    <div className="pt-2 border-t border-[#F0EAE0] flex items-center justify-between text-[10px]">
                        <span className="text-slate-700">Debounce: 10s</span>
                        <span className="text-amber-700 font-medium flex items-center gap-0.5">
                            Ativo <ShieldCheck className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            )}
        </aside>
    );
}

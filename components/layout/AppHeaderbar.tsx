"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    CalendarDays,
    Users,
    Stethoscope,
    FileText,
    Settings,
    Bell,
    Menu,
    X,
    LayoutDashboard
} from "lucide-react";
import { ThreeLogo } from "@/components/ui/ThreeLogo";
import { cn } from "@/lib/utils";

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL || "wss://n8n-silvia-py.yyuhkk.easypanel.host/ws/orchestrator";

export function AppHeaderbar() {
    const pathname = usePathname();
    const [isWsConnected, setIsWsConnected] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Monitoramento do WebSocket em nível de header
    useEffect(() => {
        let ws: WebSocket | null = null;
        let isMounted = true;

        const checkConnection = () => {
            try {
                ws = new WebSocket(DEFAULT_WS_URL);
                ws.onopen = () => {
                    if (isMounted) setIsWsConnected(true);
                };
                ws.onclose = () => {
                    if (isMounted) setIsWsConnected(false);
                    setTimeout(() => {
                        if (isMounted) checkConnection();
                    }, 5000);
                };
                ws.onerror = () => {
                    if (ws?.readyState === WebSocket.OPEN) ws.close();
                };
            } catch {
                setTimeout(() => {
                    if (isMounted) checkConnection();
                }, 5000);
            }
        };

        checkConnection();

        return () => {
            isMounted = false;
            if (ws) ws.close();
        };
    }, []);

    const navItems = [
        { label: "Orquestrador IA", href: "/dashboard/orchestrator", icon: Activity },
        { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
        { label: "Agendamentos", href: "/dashboard/bookings", icon: CalendarDays },
        { label: "Pacientes", href: "/dashboard/patients", icon: Users },
        { label: "Corpo Clínico", href: "/dashboard/doctors", icon: Stethoscope },
        { label: "Receitas", href: "/dashboard/prescriptions", icon: FileText },
        { label: "Configurações", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <header className="sticky top-0 z-50 w-full max-w-full px-4 sm:px-6 lg:px-8 py-3 border-b border-[#E8E2D6]/70 bg-[#FBF9F4]/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all">
            <div className="mx-auto flex items-center justify-between gap-3 max-w-[1600px] w-full">
                
                {/* Esquerda: Logo Oficial Silvia (Fiel à Referência 2) */}
                <div className="flex items-center gap-2 shrink-0">
                    <ThreeLogo />
                </div>

                {/* Centro: Barra de Pílulas de Navegação Global (Responsiva e sem sobreposição) */}
                <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 p-1 rounded-full bg-white/95 border border-[#E8E2D6] shadow-[0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur-md shrink-0">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-3 2xl:px-4 py-1.5 rounded-full text-[11px] 2xl:text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap group",
                                    isActive
                                        ? "bg-[#1E2022] text-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] font-semibold"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]/80"
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-amber-400" : "text-slate-600 group-hover:text-slate-800")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Direita: Status Live, Notificações, e Perfil Silvia */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    
                    {/* Badge de Status WebSocket */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D6] shadow-sm text-xs font-semibold text-slate-800 shrink-0">
                        <span className="relative flex h-2 w-2">
                            {isWsConnected && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            )}
                            <span className={cn("relative inline-flex rounded-full h-2 w-2", isWsConnected ? "bg-emerald-500" : "bg-amber-500")} />
                        </span>
                        <span className="text-[11px] font-mono text-slate-700 whitespace-nowrap">
                            {isWsConnected ? "WebSocket Live" : "Sincronizado"}
                        </span>
                    </div>

                    {/* Notificações */}
                    <button
                        className="w-8 h-8 rounded-full bg-white border border-[#E8E2D6] shadow-sm flex items-center justify-center text-slate-700 hover:bg-[#F4EFE6] relative transition-colors shrink-0"
                        title="Notificações do Sistema"
                    >
                        <Bell className="w-3.5 h-3.5" />
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
                    </button>

                    {/* Avatar Silvia com o retrato do Hospital Otorrinos */}
                    <Link
                        href="/dashboard/orchestrator"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-sm relative group cursor-pointer shrink-0"
                        title="Silvia • Hospital Otorrinos Curitiba"
                    >
                        <img
                            src="/silvia-avatar-warm.jpg"
                            alt="Silvia Avatar"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                                e.currentTarget.src = "/silvia-profile-3d.png";
                            }}
                        />
                    </Link>

                    {/* Botão Hambúrguer Mobile / Telas menores que XL */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="xl:hidden p-1.5 sm:p-2 rounded-xl bg-white border border-[#E8E2D6] text-slate-700 hover:bg-[#F4EFE6] transition-colors shrink-0"
                        title="Menu de navegação"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

            </div>

            {/* Menu Mobile / Tablet Dropdown */}
            {isMobileMenuOpen && (
                <div className="xl:hidden mt-3 pt-3 border-t border-[#E8E2D6] space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-medium transition-colors",
                                    isActive
                                        ? "bg-[#1E2022] text-white font-semibold"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-white"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-slate-700")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}

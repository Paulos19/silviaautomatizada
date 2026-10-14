"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Settings,
    Bell,
    Sparkles,
    Menu,
    ChevronDown,
    ArrowUpRight,
    Radio
} from "lucide-react";
import { OrchestratorSidebar } from "@/components/dashboard/orchestrator/OrchestratorSidebar";
import { ClinicSettingsProvider } from "@/components/dashboard/clinic-settings-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OrchestratorLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    const topNavPills = [
        { label: "Dashboard", href: "/dashboard/orchestrator", active: true },
        { label: "Pacientes", href: "/dashboard/patients", active: false },
        { label: "Agendamentos", href: "/dashboard/bookings", active: false },
        { label: "Médicos", href: "/dashboard/doctors", active: false },
        { label: "Receitas", href: "/dashboard/prescriptions", active: false },
        { label: "Configurações", href: "/dashboard/settings", active: false }
    ];

    return (
        <ClinicSettingsProvider>
            <div className="flex h-screen overflow-hidden bg-[#FBF9F4] text-slate-800 relative selection:bg-amber-200/60 font-sans">
                
                {/* Ambient Radial Golden Glow (Inspirado fielmente na referência do usuário) */}
                <div className="absolute top-0 right-0 w-[650px] h-[550px] bg-gradient-to-bl from-amber-200/35 via-yellow-100/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
                <div className="absolute bottom-0 left-1/4 w-[450px] h-[350px] bg-gradient-to-tr from-amber-100/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

                {/* Overlay para Mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Sidebar Dedicada do Orquestrador */}
                <OrchestratorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                {/* Área Principal */}
                <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
                    
                    {/* Top Header / Pill Navigation Bar (Fiel à Referência) */}
                    <header className="px-5 md:px-10 pt-5 pb-3 flex items-center justify-between gap-4 border-b border-[#E8E2D6]/60 bg-[#FBF9F4]/70 backdrop-blur-md">
                        
                        {/* Esquerda: Botão Mobile + Marca Silv.IA Pill */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="md:hidden p-2 rounded-2xl bg-white border border-[#E8E2D6] text-slate-700 hover:bg-[#F2ECE0]"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="px-4 py-2 rounded-full bg-white border border-[#E8E2D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-2 text-xs font-semibold text-slate-800">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Silv.IA Orchestrator</span>
                            </div>
                        </div>

                        {/* Centro: Pílulas de Navegação (Referência: Dashboard, People, Hiring, etc.) */}
                        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/90 border border-[#E8E2D6] shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm">
                            {topNavPills.map((pill) => (
                                <Link
                                    key={pill.label}
                                    href={pill.href}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                                        pill.active
                                            ? "bg-[#1E2022] text-white shadow-[0_2px_10px_rgba(0,0,0,0.15)] font-semibold"
                                            : "text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]/70"
                                    )}
                                >
                                    {pill.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Direita: Ações Rápidas (Settings, Notifications, Avatar) */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                href="/dashboard/settings"
                                className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D6] shadow-sm text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6] flex items-center gap-1.5 transition-colors"
                            >
                                <Settings className="w-3.5 h-3.5 text-slate-700" />
                                <span className="hidden sm:inline">Settings</span>
                            </Link>

                            <button className="w-8 h-8 rounded-full bg-white border border-[#E8E2D6] shadow-sm flex items-center justify-center text-slate-700 hover:bg-[#F4EFE6] relative transition-colors">
                                <Bell className="w-3.5 h-3.5" />
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
                            </button>

                            {/* Avatar da Silvia / Concierge Médica */}
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-300 shadow-sm relative group cursor-pointer">
                                <img
                                    src="/silvia-avatar-warm.jpg"
                                    alt="Silvia Avatar"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                        // Fallback se imagem demorar a carregar
                                        e.currentTarget.src = "/silvia-profile-3d.png";
                                    }}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Conteúdo Dinâmico do Bento Grid */}
                    <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8 lg:px-12 py-6 custom-scrollbar">
                        <div className="mx-auto max-w-[1520px] pb-12">
                            {children}
                        </div>
                    </div>

                </main>
            </div>
        </ClinicSettingsProvider>
    );
}

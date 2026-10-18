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
    LayoutDashboard,
    LogOut,
    Clock,
    Send
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ThreeLogo } from "@/components/ui/ThreeLogo";
import { LiveNotificationsModal, NotificationItem } from "@/components/dashboard/LiveNotificationsModal";
import { cn } from "@/lib/utils";

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || "https://n8n-silvia-py.yyuhkk.easypanel.host";
const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL || "wss://n8n-silvia-py.yyuhkk.easypanel.host/ws/orchestrator";

export function AppHeaderbar() {
    const pathname = usePathname();
    const [isWsConnected, setIsWsConnected] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    // Carrega eventos e monitora o WebSocket para notificações em tempo real
    useEffect(() => {
        let ws: WebSocket | null = null;
        let isMounted = true;

        // Snapshot inicial da API
        fetch(`${DEFAULT_API_URL}/orchestrator/metrics`)
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && data.recent_events) {
                    const formatted = data.recent_events.slice(0, 30).map((evt: any, idx: number) => ({
                        id: evt.id || `notif-init-${idx}`,
                        timestamp: evt.timestamp || new Date().toISOString(),
                        time: evt.time || "Hoje",
                        type: evt.type || "INFO",
                        title: evt.title || "Evento Silvia",
                        description: evt.description || "",
                        severity: evt.severity || "info",
                        read: idx > 4, // Primeiras 5 são novas
                        metadata: evt.metadata
                    }));
                    setNotifications(formatted);
                }
            })
            .catch(() => {});

        // Conexão ao vivo com WebSocket
        const checkConnection = () => {
            try {
                ws = new WebSocket(DEFAULT_WS_URL);
                ws.onopen = () => {
                    if (isMounted) setIsWsConnected(true);
                };
                ws.onmessage = (event) => {
                    if (!isMounted) return;
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.type === "NEW_EVENT" && msg.event) {
                            const newEvt = msg.event;
                            const item: NotificationItem = {
                                id: newEvt.id || `notif-${Date.now()}`,
                                timestamp: newEvt.timestamp || new Date().toISOString(),
                                time: newEvt.time || "Agora",
                                type: newEvt.type || "INFO",
                                title: newEvt.title || "Nova Atividade",
                                description: newEvt.description || "",
                                severity: newEvt.severity || "info",
                                read: false,
                                metadata: newEvt.metadata
                            };
                            setNotifications((prev) => [item, ...prev.slice(0, 49)]);
                        } else if (msg.type === "INITIAL_SNAPSHOT" && msg.data?.recent_events) {
                            const formatted = msg.data.recent_events.slice(0, 30).map((evt: any, idx: number) => ({
                                id: evt.id || `notif-${idx}`,
                                timestamp: evt.timestamp,
                                time: evt.time,
                                type: evt.type,
                                title: evt.title,
                                description: evt.description,
                                severity: evt.severity,
                                read: idx > 4,
                                metadata: evt.metadata
                            }));
                            setNotifications(formatted);
                        }
                    } catch {
                        // ignore ping
                    }
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

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Dropdown states
    const [isClinicaOpen, setIsClinicaOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const clinicaRef = React.useRef<HTMLDivElement>(null);
    const profileRef = React.useRef<HTMLDivElement>(null);

    // Fecha dropdowns ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (clinicaRef.current && !clinicaRef.current.contains(event.target as Node)) {
                setIsClinicaOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsClinicaOpen(false);
                setIsProfileOpen(false);
                setIsMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Fecha menus ao trocar de rota
    useEffect(() => {
        setIsClinicaOpen(false);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // 1. Operações Principais (Acesso Direto Diário)
    const primaryNavItems = [
        { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
        { label: "Orquestrador IA", href: "/dashboard/orchestrator", icon: Activity, badge: "IA" },
        { label: "Agendamentos", href: "/dashboard/bookings", icon: CalendarDays },
        { label: "Disparos", href: "/dashboard/disparos", icon: Send },
        { label: "Lista de Espera", href: "/dashboard/waitlist", icon: Clock },
    ];

    // 2. Módulos Clínicos e Cadastros (Menu Suspenso Especializado)
    const clinicaNavItems = [
        {
            label: "Pacientes",
            href: "/dashboard/patients",
            icon: Users,
            desc: "Cadastros, convênios e histórico de contatos",
            iconColor: "text-blue-500 bg-blue-50 border-blue-100"
        },
        {
            label: "Corpo Clínico",
            href: "/dashboard/doctors",
            icon: Stethoscope,
            desc: "Médicos, agendas e especialidades ativas",
            iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100"
        },
        {
            label: "Receitas",
            href: "/dashboard/prescriptions",
            icon: FileText,
            desc: "Pedidos de renovação e emissão de receituários",
            iconColor: "text-amber-600 bg-amber-50 border-amber-100"
        },
    ];

    // Detecta se a rota atual pertence ao submenu Clínico
    const currentClinicaItem = clinicaNavItems.find((item) => pathname === item.href);
    const isClinicaActive = Boolean(currentClinicaItem);

    return (
        <>
            <header className="sticky top-0 z-50 w-full max-w-full px-4 sm:px-6 lg:px-8 py-2.5 border-b border-[#E8E2D6]/80 bg-[#FBF9F4]/95 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
                <div className="mx-auto flex items-center justify-between gap-4 max-w-[1600px] w-full">
                    
                    {/* Esquerda: Logo Oficial Silvia */}
                    <div className="flex items-center gap-3 shrink-0">
                        <ThreeLogo />
                    </div>

                    {/* Centro: Barra de Pílulas de Navegação Central Organizada */}
                    <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/95 border border-[#E8E2D6] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md">
                        {/* 1. Itens Principais */}
                        {primaryNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap group relative",
                                        isActive
                                            ? "bg-[#1E2022] text-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] font-semibold"
                                            : "text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]/80"
                                    )}
                                >
                                    <Icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-800")} />
                                    <span>{item.label}</span>
                                    {item.badge && !isActive && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60 leading-tight">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Divisor Visual Sutil */}
                        <div className="h-4 w-px bg-[#E8E2D6] mx-0.5" />

                        {/* 2. Menu Dropdown: Gestão Clínica */}
                        <div className="relative" ref={clinicaRef}>
                            <button
                                onClick={() => setIsClinicaOpen(!isClinicaOpen)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap group cursor-pointer",
                                    isClinicaActive
                                        ? "bg-[#1E2022] text-white shadow-[0_2px_10px_rgba(0,0,0,0.18)] font-semibold"
                                        : isClinicaOpen
                                        ? "bg-[#F4EFE6] text-slate-900 font-semibold"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]/80"
                                )}
                            >
                                <Stethoscope className={cn("w-3.5 h-3.5 shrink-0", isClinicaActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-800")} />
                                <span>{currentClinicaItem ? `Clínica: ${currentClinicaItem.label}` : "Clínica"}</span>
                                <span className={cn(
                                    "text-[10px] transition-transform duration-200",
                                    isClinicaOpen ? "rotate-180" : ""
                                )}>
                                    ▾
                                </span>
                            </button>

                            {/* Dropdown Menu Card */}
                            {isClinicaOpen && (
                                <div className="absolute top-full right-0 mt-2.5 w-72 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E8E2D6] shadow-[0_14px_36px_rgba(0,0,0,0.1)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                        Módulos Clínicos & Registros
                                    </div>
                                    <div className="space-y-1">
                                        {clinicaNavItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = pathname === item.href;

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setIsClinicaOpen(false)}
                                                    className={cn(
                                                        "flex items-start gap-2.5 p-2 rounded-xl transition-all duration-150 group",
                                                        isActive
                                                            ? "bg-[#FBF9F4] border border-[#E8E2D6]"
                                                            : "hover:bg-slate-50 hover:translate-x-0.5"
                                                    )}
                                                >
                                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5", item.iconColor)}>
                                                        <Icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={cn("text-xs font-semibold", isActive ? "text-slate-900" : "text-slate-800 group-hover:text-slate-950")}>
                                                                {item.label}
                                                            </span>
                                                            {isActive && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Direita: Utilitários do Sistema (Configurações, Notificações, Perfil e Menu) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

                        {/* Botão de Atalho Rápido para Configurações */}
                        <Link
                            href="/dashboard/settings"
                            className={cn(
                                "w-8 h-8 rounded-full border shadow-sm flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0 cursor-pointer",
                                pathname === "/dashboard/settings"
                                    ? "bg-[#1E2022] text-white border-[#1E2022] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                                    : "bg-white border-[#E8E2D6] text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]"
                            )}
                            title="Configurações do Sistema"
                        >
                            <Settings className={cn("w-3.5 h-3.5", pathname === "/dashboard/settings" ? "text-amber-400" : "")} />
                        </Link>

                        {/* Botão de Notificações com Modal Interativo ao Vivo */}
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="w-8 h-8 rounded-full bg-white border border-[#E8E2D6] shadow-sm flex items-center justify-center text-slate-700 hover:bg-[#F4EFE6] relative transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                            title="Abrir Notificações ao Vivo"
                        >
                            <Bell className="w-3.5 h-3.5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center border border-white shadow-sm animate-pulse">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Divisor Vertical */}
                        <div className="h-5 w-px bg-[#E8E2D6] mx-0.5 hidden sm:block" />

                        {/* Menu de Perfil / Usuário Silvia com Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-full bg-white border border-[#E8E2D6] shadow-sm hover:bg-[#F4EFE6] transition-all cursor-pointer active:scale-95"
                                title="Menu de Usuário e Clínica"
                            >
                                <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full overflow-hidden border border-amber-400/80 shrink-0">
                                    <img
                                        src="/silvia-avatar-warm.jpg"
                                        alt="Silvia Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/silvia-profile-3d.png";
                                        }}
                                    />
                                </div>
                                <div className="hidden 2xl:flex flex-col text-left leading-none pr-0.5">
                                    <span className="text-xs font-bold text-slate-800 tracking-tight">Silvia Concierge</span>
                                    <span className="text-[10px] text-slate-500">Otorrinos Curitiba</span>
                                </div>
                                <span className={cn(
                                    "text-[9px] text-slate-400 transition-transform duration-200 hidden 2xl:inline-block",
                                    isProfileOpen ? "rotate-180" : ""
                                )}>
                                    ▾
                                </span>
                            </button>

                            {/* Dropdown Card do Perfil */}
                            {isProfileOpen && (
                                <div className="absolute top-full right-0 mt-2.5 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E8E2D6] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    {/* Cabeçalho do Card */}
                                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FBF9F4] border border-[#E8E2D6]/80 mb-2">
                                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                                            <img
                                                src="/silvia-avatar-warm.jpg"
                                                alt="Silvia"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/silvia-profile-3d.png";
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">Hospital Otorrinos</p>
                                            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Atendente IA Ativa
                                            </p>
                                        </div>
                                    </div>

                                    {/* Opções de Navegação */}
                                    <div className="space-y-1">
                                        <Link
                                            href="/dashboard/orchestrator"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]/70 transition-colors"
                                        >
                                            <Activity className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Orquestrador em Tempo Real</span>
                                        </Link>

                                        <Link
                                            href="/dashboard/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]/70 transition-colors"
                                        >
                                            <Settings className="w-3.5 h-3.5 text-slate-600" />
                                            <span>Configurações da Clínica</span>
                                        </Link>
                                    </div>

                                    {/* Divisor */}
                                    <div className="h-px bg-slate-100 my-1.5" />

                                    {/* Botão de Logout */}
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                                    >
                                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                        <span>Sair do Sistema</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Botão Hambúrguer Mobile / Telas menores que LG */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl bg-white border border-[#E8E2D6] text-slate-700 hover:bg-[#F4EFE6] transition-colors shrink-0 cursor-pointer"
                            title="Menu de navegação"
                        >
                            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>

                </div>

                {/* Menu Mobile / Tablet Dropdown Organizado por Seções */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mt-3 pt-3 border-t border-[#E8E2D6] space-y-3 animate-in fade-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
                        
                        {/* Seção 1: Operações Principais */}
                        <div>
                            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Operações Principais
                            </p>
                            <div className="space-y-1">
                                {primaryNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                                                isActive
                                                    ? "bg-[#1E2022] text-white font-semibold"
                                                    : "text-slate-700 hover:text-slate-900 hover:bg-white"
                                            )}
                                        >
                                            <Icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-slate-600")} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Seção 2: Gestão Clínica */}
                        <div>
                            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Gestão Clínica
                            </p>
                            <div className="space-y-1">
                                {clinicaNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                                                isActive
                                                    ? "bg-[#1E2022] text-white font-semibold"
                                                    : "text-slate-700 hover:text-slate-900 hover:bg-white"
                                            )}
                                        >
                                            <Icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-slate-600")} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Seção 3: Sistema e Sessão */}
                        <div className="pt-2 border-t border-[#E8E2D6]">
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors mb-1.5",
                                    pathname === "/dashboard/settings"
                                        ? "bg-[#1E2022] text-white font-semibold"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-white"
                                )}
                            >
                                <Settings className="w-4 h-4 text-slate-600" />
                                <span>Configurações do Sistema</span>
                            </Link>

                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50/80 border border-rose-200/80 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 text-rose-600" />
                                <span>Sair do sistema (Logout)</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Modal de Notificações em Tempo Real */}
            <LiveNotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllAsRead}
                onMarkAsRead={handleMarkAsRead}
                isConnected={isWsConnected}
            />
        </>
    );
}

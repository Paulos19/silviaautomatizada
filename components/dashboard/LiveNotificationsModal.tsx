"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    CalendarCheck,
    PhoneCall,
    MessageSquare,
    ExternalLink,
    X,
    Filter,
    Check,
    Clock,
    Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
    id: string;
    timestamp: string;
    time: string;
    type: string;
    title: string;
    description: string;
    severity: "success" | "warning" | "error" | "info";
    read?: boolean;
    metadata?: Record<string, any>;
}

interface LiveNotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: NotificationItem[];
    onMarkAllAsRead?: () => void;
    onMarkAsRead?: (id: string) => void;
    isConnected?: boolean;
}

export function LiveNotificationsModal({
    isOpen,
    onClose,
    notifications,
    onMarkAllAsRead,
    onMarkAsRead,
    isConnected = true
}: LiveNotificationsModalProps) {
    const [selectedTab, setSelectedTab] = useState<"ALL" | "BOOKINGS" | "HANDOFFS" | "ALERTS">("ALL");

    // Fecha ao pressionar Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Filtragem das notificações
    const filteredList = useMemo(() => {
        return notifications.filter((item) => {
            if (selectedTab === "ALL") return true;
            if (selectedTab === "BOOKINGS") {
                return item.type === "APPOINTMENT_BOOKED" || item.type === "VOUCHER_SENT" || item.type.includes("BOOKING");
            }
            if (selectedTab === "HANDOFFS") {
                return item.type === "HANDOFF_ANA" || item.type.includes("HANDOFF");
            }
            if (selectedTab === "ALERTS") {
                return item.severity === "warning" || item.severity === "error" || item.type.includes("ERROR");
            }
            return true;
        });
    }, [notifications, selectedTab]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-3 sm:p-6 sm:pt-20">
            {/* Backdrop com Blur suave */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            />

            {/* Painel do Modal / Drawer Flutuante */}
            <div className="relative w-full max-w-lg bg-white border border-[#E8E2D6] rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col max-h-[85vh] overflow-hidden z-10 animate-in fade-in slide-in-from-top-4 duration-300">
                
                {/* Header do Modal */}
                <div className="p-5 pb-4 border-b border-[#F0EAE0] flex items-center justify-between bg-[#FBF9F4]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-amber-100/80 border border-amber-300/80 flex items-center justify-center text-amber-900 shadow-sm">
                            <Bell className="w-4 h-4 text-amber-800" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 text-sm tracking-tight">
                                    Central de Notificações
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-700">
                                Eventos e alertas em tempo real da Silvia Concierge
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && onMarkAllAsRead && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="text-[11px] font-medium text-amber-800 hover:text-amber-950 transition-colors"
                            >
                                Marcar lidas
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-full bg-white border border-[#E8E2D6] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-[#F2ECE0] transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Filtros em Pílulas */}
                <div className="px-5 py-2.5 border-b border-[#F0EAE0] flex items-center gap-1.5 bg-white overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setSelectedTab("ALL")}
                        className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0",
                            selectedTab === "ALL"
                                ? "bg-[#1E2022] text-white shadow-sm font-semibold"
                                : "bg-[#FBF9F4] text-slate-700 hover:bg-[#F2ECE0] border border-[#E8E2D6]"
                        )}
                    >
                        Todas ({notifications.length})
                    </button>

                    <button
                        onClick={() => setSelectedTab("BOOKINGS")}
                        className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 flex items-center gap-1",
                            selectedTab === "BOOKINGS"
                                ? "bg-[#1E2022] text-white shadow-sm font-semibold"
                                : "bg-[#FBF9F4] text-slate-700 hover:bg-[#F2ECE0] border border-[#E8E2D6]"
                        )}
                    >
                        <CalendarCheck className="w-3 h-3 text-amber-600" />
                        Agendamentos
                    </button>

                    <button
                        onClick={() => setSelectedTab("HANDOFFS")}
                        className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 flex items-center gap-1",
                            selectedTab === "HANDOFFS"
                                ? "bg-[#1E2022] text-white shadow-sm font-semibold"
                                : "bg-[#FBF9F4] text-slate-700 hover:bg-[#F2ECE0] border border-[#E8E2D6]"
                        )}
                    >
                        <PhoneCall className="w-3 h-3 text-emerald-600" />
                        Handoffs
                    </button>

                    <button
                        onClick={() => setSelectedTab("ALERTS")}
                        className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 flex items-center gap-1",
                            selectedTab === "ALERTS"
                                ? "bg-[#1E2022] text-white shadow-sm font-semibold"
                                : "bg-[#FBF9F4] text-slate-700 hover:bg-[#F2ECE0] border border-[#E8E2D6]"
                        )}
                    >
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Alertas
                    </button>
                </div>

                {/* Lista de Notificações com Scroll */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar min-h-[300px]">
                    {filteredList.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-center text-slate-600 gap-2">
                            <Bell className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                            <p className="text-xs font-medium text-slate-700">Nenhuma notificação encontrada</p>
                            <span className="text-[11px] text-slate-600">Aguardando novos eventos em tempo real...</span>
                        </div>
                    ) : (
                        filteredList.map((item) => {
                            const isBooking = item.type === "APPOINTMENT_BOOKED" || item.type === "VOUCHER_SENT";
                            const isHandoff = item.type === "HANDOFF_ANA";
                            const isError = item.severity === "error" || item.type.includes("ERROR");

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onMarkAsRead?.(item.id)}
                                    className={cn(
                                        "p-3 rounded-2xl border transition-all text-xs flex items-start justify-between gap-3 cursor-pointer group",
                                        !item.read
                                            ? "bg-[#FFFDF9] border-amber-300/80 shadow-[0_2px_8px_rgba(245,190,56,0.08)]"
                                            : "bg-[#FBF9F4] border-[#E8E2D6] opacity-80 hover:opacity-100"
                                    )}
                                >
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        {/* Ícone de Severidade */}
                                        <div className={cn(
                                            "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                                            isBooking ? "bg-amber-100 text-amber-700 border border-amber-300" :
                                            isHandoff ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                                            isError ? "bg-rose-100 text-rose-700 border border-rose-300" :
                                            "bg-blue-100 text-blue-700 border border-blue-300"
                                        )}>
                                            {isBooking ? <CalendarCheck className="w-3.5 h-3.5" /> :
                                             isHandoff ? <PhoneCall className="w-3.5 h-3.5" /> :
                                             isError ? <AlertTriangle className="w-3.5 h-3.5" /> :
                                             <MessageSquare className="w-3.5 h-3.5" />}
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-slate-900 text-xs">
                                                    {item.title}
                                                </span>
                                                <span className="px-1.5 py-0.2 rounded bg-white text-slate-700 text-[9px] font-mono border border-[#E0D8C8]">
                                                    {item.type}
                                                </span>
                                                {!item.read && (
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                                )}
                                            </div>

                                            <p className="text-[11px] text-slate-700 mt-1 leading-relaxed break-words">
                                                {item.description}
                                            </p>

                                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-600 font-mono">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-slate-500" />
                                                    {item.time}
                                                </span>
                                                {item.metadata?.patient_name && (
                                                    <span className="text-slate-800 font-sans font-medium">
                                                        {item.metadata.patient_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex flex-col items-end gap-1">
                                        <Link
                                            href="/dashboard/orchestrator"
                                            onClick={onClose}
                                            className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                                            title="Ver no Orquestrador"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Rodapé Informativo */}
                <div className="p-3 bg-[#FBF9F4] border-t border-[#F0EAE0] flex items-center justify-between text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Hospital Otorrinos Curitiba • Instância Silvia
                    </span>

                    <Link
                        href="/dashboard/orchestrator"
                        onClick={onClose}
                        className="font-semibold text-slate-900 hover:text-amber-800 flex items-center gap-1"
                    >
                        Abrir Orquestrador
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>

            </div>
        </div>
    );
}

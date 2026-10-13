"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    Search,
    MoreVertical,
    Check,
    CheckCheck,
    Calendar,
    FileText,
    Pill,
    AlertTriangle,
    ArrowLeft,
    Phone,
    Video,
    Smile,
    Paperclip,
    Mic,
    Send,
    User,
    Wifi,
    Battery,
    ExternalLink,
    Download,
    MessageSquare,
    Clock,
    Sparkles,
    Pin
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WhatsAppMessage {
    id: string;
    sender: "patient" | "silvia" | "system";
    time: string;
    timestamp: number;
    text: string;
    type?: "text" | "booking" | "voucher" | "handoff" | "prescription" | "error";
    metadata?: Record<string, any>;
}

export interface WhatsAppChat {
    phone: string;
    formattedPhone: string;
    name: string;
    avatarColor: string;
    avatarInitial: string;
    lastMessage: string;
    lastTime: string;
    lastTimestamp: number;
    unreadCount: number;
    status: "active" | "booked" | "cancelled" | "handoff" | "prescription";
    isPinned?: boolean;
    messages: WhatsAppMessage[];
}

interface WhatsAppPhoneScreenProps {
    chats: WhatsAppChat[];
    selectedChatPhone: string | null;
    onSelectChat: (phone: string | null) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    onDownloadPdf?: () => void;
}

export function WhatsAppPhoneScreen({
    chats,
    selectedChatPhone,
    onSelectChat,
    activeFilter,
    onFilterChange,
    onDownloadPdf
}: WhatsAppPhoneScreenProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentTime, setCurrentTime] = useState(() => {
        const now = new Date();
        return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    });

    // Filtra as conversas pela busca e pelas tags
    const filteredChats = useMemo(() => {
        return chats.filter((chat) => {
            // Busca textual
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = chat.name.toLowerCase().includes(q);
                const matchPhone = chat.phone.includes(q) || chat.formattedPhone.includes(q);
                const matchLastMsg = chat.lastMessage.toLowerCase().includes(q);
                if (!matchName && !matchPhone && !matchLastMsg) return false;
            }

            // Filtro por abas
            if (activeFilter === "ALL") return true;
            if (activeFilter === "BOOKINGS") return chat.status === "booked" || chat.status === "cancelled";
            if (activeFilter === "PRESCRIPTIONS") return chat.status === "prescription";
            if (activeFilter === "HANDOFF") return chat.status === "handoff";
            if (activeFilter === "UNREAD") return chat.unreadCount > 0;
            return true;
        });
    }, [chats, searchQuery, activeFilter]);

    const activeChat = useMemo(() => {
        return chats.find((c) => c.phone === selectedChatPhone) || null;
    }, [chats, selectedChatPhone]);

    return (
        <div className="relative w-full h-full bg-[#111B21] text-[#E9EDEF] flex flex-col font-sans select-none overflow-hidden">
            {/* --- 1. STATUS BAR DO SMARTPHONE (Android/iOS) --- */}
            <div className="h-7 w-full bg-[#111B21] flex items-center justify-between px-6 pt-1 text-[11px] font-medium text-slate-300 z-50 shrink-0">
                <span>{currentTime}</span>
                <div className="flex items-center gap-1.5 text-slate-300">
                    <Wifi className="w-3 h-3" />
                    <span className="text-[10px] font-bold">5G</span>
                    <Battery className="w-3.5 h-3.5" />
                </div>
            </div>

            {/* --- 2. CONTEÚDO PRINCIPAL (LISTA OU CHAT ABERTO) --- */}
            <div className="relative flex-1 w-full overflow-hidden flex flex-col">
                <AnimatePresence initial={false} mode="wait">
                    {!activeChat ? (
                        /* ============================================================ */
                        /*                TELA DA LISTA DE CONVERSAS (CHATS)            */
                        /* ============================================================ */
                        <motion.div
                            key="chats-list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="flex flex-col h-full w-full"
                        >
                            {/* Header WhatsApp */}
                            <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#202C33] bg-[#111B21] shrink-0">
                                <span className="text-xl font-bold tracking-tight text-[#00A884]">
                                    WhatsApp
                                </span>
                                <div className="flex items-center gap-4 text-[#AEBAC1]">
                                    <button className="hover:text-white transition-colors">
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    <button className="hover:text-white transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Barra de Busca "Ask Meta AI or Search" */}
                            <div className="px-3 pt-2.5 pb-2 bg-[#111B21] shrink-0">
                                <div className="relative flex items-center bg-[#202C33] rounded-full px-3 py-1.5 border border-[#2A3942]/60 shadow-inner">
                                    {/* Ícone de anel colorido Meta AI */}
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 p-[1.5px] mr-2 shrink-0">
                                        <div className="w-full h-full rounded-full bg-[#202C33]" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar paciente ou número..."
                                        className="w-full bg-transparent text-xs text-[#E9EDEF] placeholder-[#8696A0] outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="text-xs text-[#8696A0] hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filtros em Pílulas (Pills) como na Referência 2 */}
                            <div className="px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-b border-[#202C33]/60 bg-[#111B21]">
                                {[
                                    { id: "ALL", label: "Todos" },
                                    { id: "BOOKINGS", label: "Consultas" },
                                    { id: "PRESCRIPTIONS", label: "Receitas" },
                                    { id: "HANDOFF", label: "Ana ⚠️" },
                                    { id: "UNREAD", label: "Não lidas" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => onFilterChange(tab.id)}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                                            activeFilter === tab.id
                                                ? "bg-[#00A884] text-[#111B21] font-semibold shadow-sm"
                                                : "bg-[#202C33] text-[#8696A0] hover:bg-[#2A3942] hover:text-[#E9EDEF]"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Lista de Contatos com Separador (Referência 2) */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#202C33]/50">
                                {filteredChats.length === 0 ? (
                                    <div className="p-8 text-center text-[#8696A0] text-xs space-y-2">
                                        <MessageSquare className="w-8 h-8 text-[#8696A0]/40 mx-auto" />
                                        <p>Nenhuma conversa encontrada neste filtro.</p>
                                        <p className="text-[11px] text-[#8696A0]/60">
                                            Envie uma mensagem no WhatsApp para ver o contato aparecer aqui instantaneamente!
                                        </p>
                                    </div>
                                ) : (
                                    filteredChats.map((chat) => (
                                        <div
                                            key={chat.phone}
                                            onClick={() => onSelectChat(chat.phone)}
                                            className="px-3.5 py-3 flex items-center gap-3 hover:bg-[#202C33]/60 active:bg-[#202C33] cursor-pointer transition-colors group relative"
                                        >
                                            {/* Bolinha do Avatar */}
                                            <div className="relative shrink-0">
                                                <div
                                                    className={cn(
                                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm",
                                                        chat.avatarColor
                                                    )}
                                                >
                                                    {chat.avatarInitial}
                                                </div>
                                                {/* Badge de status no avatar */}
                                                {chat.status === "handoff" && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-[#111B21] flex items-center justify-center text-[9px] font-bold text-white">
                                                        !
                                                    </span>
                                                )}
                                                {chat.status === "booked" && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00A884] border-2 border-[#111B21] flex items-center justify-center text-[9px] font-bold text-white">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>

                                            {/* Dados do Contato & Última Mensagem */}
                                            <div className="flex-1 min-w-0 pr-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h3 className="text-sm font-semibold text-[#E9EDEF] truncate group-hover:text-white">
                                                        {chat.name}
                                                    </h3>
                                                    <span className="text-[11px] text-[#8696A0] font-mono shrink-0 ml-2">
                                                        {chat.lastTime}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="text-xs text-[#8696A0] truncate flex items-center gap-1">
                                                        {/* Ícone de status da mensagem */}
                                                        {chat.lastMessage.startsWith("✓✓") && (
                                                            <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] shrink-0 inline" />
                                                        )}
                                                        <span>{chat.lastMessage.replace("✓✓", "").trim()}</span>
                                                    </p>

                                                    {/* Badge de mensagens ou pin */}
                                                    {chat.isPinned ? (
                                                        <Pin className="w-3 h-3 text-[#8696A0] shrink-0" />
                                                    ) : chat.unreadCount > 0 ? (
                                                        <span className="min-w-4 h-4 px-1 rounded-full bg-[#00A884] text-[#111B21] text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            {chat.unreadCount}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Floating Action Button (FAB) verde do WhatsApp */}
                            <div className="absolute bottom-16 right-4 z-30">
                                <button className="w-12 h-12 rounded-2xl bg-[#00A884] hover:bg-[#008f6f] text-[#111B21] shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
                                    <MessageSquare className="w-5 h-5 fill-current" />
                                </button>
                            </div>

                            {/* Barra Inferior de Navegação do WhatsApp */}
                            <div className="h-14 bg-[#111B21] border-t border-[#202C33] flex items-center justify-around px-2 text-[#8696A0] shrink-0">
                                <button
                                    onClick={() => onFilterChange("ALL")}
                                    className={cn(
                                        "flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-colors",
                                        activeFilter === "ALL" ? "text-[#00A884]" : "hover:text-[#E9EDEF]"
                                    )}
                                >
                                    <div className="relative">
                                        <MessageSquare className="w-5 h-5 fill-current" />
                                        {chats.length > 0 && (
                                            <span className="absolute -top-1 -right-2 bg-[#00A884] text-[#111B21] text-[9px] font-bold px-1 rounded-full">
                                                {chats.length}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-semibold">Conversas</span>
                                </button>

                                <button
                                    onClick={() => onFilterChange("BOOKINGS")}
                                    className={cn(
                                        "flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-colors",
                                        activeFilter === "BOOKINGS" ? "text-[#00A884]" : "hover:text-[#E9EDEF]"
                                    )}
                                >
                                    <Calendar className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">Consultas</span>
                                </button>

                                <button
                                    onClick={() => onFilterChange("PRESCRIPTIONS")}
                                    className={cn(
                                        "flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-colors",
                                        activeFilter === "PRESCRIPTIONS" ? "text-[#00A884]" : "hover:text-[#E9EDEF]"
                                    )}
                                >
                                    <Pill className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">Receitas</span>
                                </button>

                                <button
                                    onClick={() => onFilterChange("HANDOFF")}
                                    className={cn(
                                        "flex flex-col items-center gap-1 py-1 px-3 rounded-full transition-colors",
                                        activeFilter === "HANDOFF" ? "text-[#00A884]" : "hover:text-[#E9EDEF]"
                                    )}
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">Recepção</span>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* ============================================================ */
                        /*                TELA DA CONVERSA INDIVIDUAL (CHAT ROOM)       */
                        /* ============================================================ */
                        <motion.div
                            key="chat-room"
                            initial={{ opacity: 0, x: 25 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 25 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="flex flex-col h-full w-full bg-[#0B141A]"
                        >
                            {/* Header do Chat */}
                            <div className="px-3 py-2 bg-[#202C33] flex items-center justify-between border-b border-[#2A3942] shrink-0 z-20">
                                <div className="flex items-center gap-2 min-w-0">
                                    <button
                                        onClick={() => onSelectChat(null)}
                                        className="p-1 -ml-1 text-[#AEBAC1] hover:text-white rounded-full hover:bg-[#2A3942] transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0",
                                            activeChat.avatarColor
                                        )}
                                    >
                                        {activeChat.avatarInitial}
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-xs font-semibold text-[#E9EDEF] truncate leading-tight">
                                            {activeChat.name}
                                        </h3>
                                        <p className="text-[10px] text-[#00A884] font-medium truncate">
                                            Online • Silv.IA Consultório
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-[#AEBAC1] shrink-0">
                                    <a
                                        href={`https://wa.me/${activeChat.phone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Abrir no WhatsApp Web"
                                        className="hover:text-white transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-[#00A884]" />
                                    </a>
                                    <button className="hover:text-white transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="hover:text-white transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Área de Mensagens com Wallpaper WhatsApp */}
                            <div
                                className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar relative"
                                style={{
                                    backgroundImage: `radial-gradient(#202C33 1px, transparent 1px)`,
                                    backgroundSize: "20px 20px"
                                }}
                            >
                                {/* Pílula de Data */}
                                <div className="flex justify-center my-2">
                                    <span className="px-3 py-0.5 rounded-lg bg-[#182229] border border-[#202C33] text-[10px] font-semibold text-[#8696A0] uppercase tracking-wider shadow-sm">
                                        Hoje
                                    </span>
                                </div>

                                {/* Balões de Mensagem */}
                                {activeChat.messages.map((msg) => {
                                    const isSilvia = msg.sender === "silvia";
                                    const isSystem = msg.sender === "system";

                                    // 1. Cards de Sistema Especiais
                                    if (msg.type === "booking") {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-2">
                                                <div className="w-full max-w-[310px] p-3 rounded-2xl bg-[#005C4B]/20 border border-[#00A884]/40 backdrop-blur-md shadow-md space-y-1.5">
                                                    <div className="flex items-center gap-2 text-[#00A884] font-bold text-xs">
                                                        <Calendar className="w-4 h-4 shrink-0" />
                                                        <span>Consulta Médica Agendada</span>
                                                    </div>
                                                    <p className="text-[11px] text-[#E9EDEF] leading-relaxed">
                                                        {msg.text}
                                                    </p>
                                                    <div className="pt-1 flex items-center justify-between text-[10px] text-[#8696A0] font-mono border-t border-[#00A884]/20">
                                                        <span>Dr. Marco Antonio • Psiquiatria</span>
                                                        <span>{msg.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (msg.type === "voucher") {
                                        return (
                                            <div key={msg.id} className="flex justify-end my-1.5">
                                                <div className="w-full max-w-[280px] p-2.5 rounded-2xl bg-[#005C4B] text-white shadow-md space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 rounded-xl bg-white/10 text-white">
                                                            <FileText className="w-5 h-5 text-teal-300" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold truncate">Comprovante de Agendamento</p>
                                                            <p className="text-[10px] text-teal-200">PDF • Hospital Otorrinos</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={onDownloadPdf}
                                                        className="w-full py-1 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                        Baixar Comprovante
                                                    </button>
                                                    <div className="flex justify-end items-center gap-1 text-[9px] text-teal-200/80">
                                                        <span>{msg.time}</span>
                                                        <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (msg.type === "handoff") {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-2">
                                                <div className="w-full max-w-[310px] p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-1 shadow-sm">
                                                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Transferido para a Recepção (Ana)</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-200">{msg.text}</p>
                                                    <p className="text-[9px] text-amber-300/80 text-right font-mono">{msg.time}</p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // 2. Balão Padrão de Conversa (Paciente ou Silvia)
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full",
                                                isSilvia ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[82%] px-3 py-1.5 rounded-2xl text-xs relative shadow-sm leading-relaxed",
                                                    isSilvia
                                                        ? "bg-[#005C4B] text-[#E9EDEF] rounded-tr-xs"
                                                        : "bg-[#202C33] text-[#E9EDEF] rounded-tl-xs"
                                                )}
                                            >
                                                <p className="pr-12 whitespace-pre-wrap">{msg.text}</p>
                                                <div className="absolute right-2 bottom-1 flex items-center gap-1 text-[9px] text-[#8696A0]">
                                                    <span>{msg.time}</span>
                                                    {isSilvia && (
                                                        <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Barra Inferior de Digitação (Simulação do WhatsApp) */}
                            <div className="p-2 bg-[#202C33] flex items-center gap-2 border-t border-[#2A3942] shrink-0">
                                <div className="flex-1 flex items-center bg-[#2A3942] rounded-full px-3 py-1.5 gap-2">
                                    <Smile className="w-4 h-4 text-[#8696A0] hover:text-white cursor-pointer" />
                                    <input
                                        type="text"
                                        disabled
                                        placeholder="Atendimento autônomo Silv.IA..."
                                        className="w-full bg-transparent text-xs text-[#E9EDEF] placeholder-[#8696A0] outline-none cursor-not-allowed"
                                    />
                                    <Paperclip className="w-4 h-4 text-[#8696A0] hover:text-white cursor-pointer" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#00A884] text-[#111B21] flex items-center justify-center shrink-0 shadow-md">
                                    <Mic className="w-4 h-4 fill-current" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

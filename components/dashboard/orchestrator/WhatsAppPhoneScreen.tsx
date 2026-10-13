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
    CircleDot,
    Users2,
    PhoneCall
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

/**
 * Divide mensagens por quebras (como " | " ou quebras de linha duplas)
 * para renderizar em múltiplos balões individuais de WhatsApp (Referência 2).
 */
function splitMessageIntoBubbles(rawText: string): string[] {
    if (!rawText) return [];

    let cleaned = rawText
        .replace(/^Recebida:\s*"?/i, "")
        .replace(/^Enviada:\s*"?/i, "")
        .replace(/"?$/, "")
        .trim();

    if (cleaned.includes("|")) {
        const parts = cleaned
            .split(/\s*\|\s*/)
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
        if (parts.length > 0) return parts;
    }

    if (cleaned.includes("\n\n")) {
        const parts = cleaned
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
        if (parts.length > 0) return parts;
    }

    return [cleaned];
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
    const [currentTime] = useState(() => {
        const now = new Date();
        return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    });

    // Filtra as conversas pela busca e pelas tags
    const filteredChats = useMemo(() => {
        return chats.filter((chat) => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = chat.name.toLowerCase().includes(q);
                const matchPhone = chat.phone.includes(q) || chat.formattedPhone.includes(q);
                const matchLastMsg = chat.lastMessage.toLowerCase().includes(q);
                if (!matchName && !matchPhone && !matchLastMsg) return false;
            }

            if (activeFilter === "ALL") return true;
            if (activeFilter === "BOOKINGS") return chat.status === "booked" || chat.status === "cancelled";
            if (activeFilter === "PRESCRIPTIONS") return chat.status === "prescription";
            if (activeFilter === "HANDOFF") return chat.status === "handoff";
            if (activeFilter === "UNREAD") return chat.unreadCount > 0;
            return true;
        });
    }, [chats, searchQuery, activeFilter]);

    // Conversa ativa selecionada (null = lista de contatos)
    const activeChat = useMemo(() => {
        if (!selectedChatPhone) return null;
        return chats.find((c) => c.phone === selectedChatPhone) || null;
    }, [chats, selectedChatPhone]);

    return (
        <div className="relative w-full h-full bg-white text-[#111B21] flex flex-col font-sans select-none overflow-hidden">
            {/* --- 1. STATUS BAR SUPERIOR DO SMARTPHONE --- */}
            <div
                className={cn(
                    "h-6 w-full flex items-center justify-between px-5 text-[11px] font-medium z-50 shrink-0 transition-colors",
                    activeChat ? "bg-[#005C4B] text-white" : "bg-white text-slate-800 border-b border-slate-100"
                )}
            >
                <span className="font-semibold text-[10px]">{currentTime}</span>
                {/* Punch-hole central do smartphone */}
                <div className="w-2.5 h-2.5 rounded-full bg-black/60 border border-white/20" />
                <div className="flex items-center gap-1.5 text-[10px]">
                    <Wifi className="w-3 h-3" />
                    <span className="font-bold text-[9px]">85%</span>
                    <Battery className="w-3.5 h-3.5" />
                </div>
            </div>

            {/* --- 2. CONTEÚDO PRINCIPAL (LISTA DE CONVERSAS OU CHAT ROOM) --- */}
            <div className="relative flex-1 w-full overflow-hidden flex flex-col">
                <AnimatePresence initial={false} mode="wait">
                    {!activeChat ? (
                        /* ============================================================ */
                        /*         TELA DA LISTA DE CONVERSAS (CHATS - REFERÊNCIA 2)    */
                        /* ============================================================ */
                        <motion.div
                            key="chats-list"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col h-full w-full bg-white"
                        >
                            {/* Header Superior WhatsApp (Branco com Logo Verde - Ref 2) */}
                            <div className="px-4 pt-2.5 pb-2 flex items-center justify-between bg-white shrink-0">
                                <span className="text-xl font-bold tracking-tight text-[#008069]">
                                    WhatsApp
                                </span>
                                <div className="flex items-center gap-4 text-slate-700">
                                    <button
                                        type="button"
                                        className="hover:text-black transition-colors"
                                        title="Câmera"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        className="hover:text-black transition-colors"
                                        title="Mais opções"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Barra de Busca "Ask Meta AI or Search" (Referência 2) */}
                            <div className="px-3 py-1.5 bg-white shrink-0">
                                <div className="relative flex items-center bg-[#F0F2F5] rounded-full px-3 py-2 border border-slate-200/50">
                                    {/* Anel colorido Meta AI */}
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 p-[1.5px] mr-2.5 shrink-0">
                                        <div className="w-full h-full rounded-full bg-[#F0F2F5]" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Ask Meta AI or Search"
                                        className="w-full bg-transparent text-xs text-[#111B21] placeholder-[#54656F] outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="text-xs text-[#54656F] hover:text-black ml-1"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Menus de Filtro em Pílulas (Pills - Referência 2) */}
                            <div className="px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-white">
                                {[
                                    { id: "ALL", label: "All" },
                                    { id: "BOOKINGS", label: "Consultas" },
                                    { id: "PRESCRIPTIONS", label: "Receitas" },
                                    { id: "HANDOFF", label: "Ana ⚠️" },
                                    { id: "UNREAD", label: "Unread" },
                                ].map((tab) => {
                                    const isSelected = activeFilter === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => onFilterChange(tab.id)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                                                isSelected
                                                    ? "bg-[#D8FDD2] text-[#008069] font-bold"
                                                    : "bg-[#F0F2F5] text-[#54656F] hover:bg-[#E4E6EB]"
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Lista de Contatos Reais com Avatar, Nome e Separador (Referência 2) */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredChats.length === 0 ? (
                                    <div className="p-8 text-center text-[#54656F] text-xs space-y-2">
                                        <MessageSquare className="w-8 h-8 text-[#54656F]/40 mx-auto" />
                                        <p className="font-semibold">Nenhuma conversa encontrada neste filtro.</p>
                                        <p className="text-[11px] text-[#54656F]/70">
                                            As mensagens recebidas pela Silvia aparecerão aqui em tempo real.
                                        </p>
                                    </div>
                                ) : (
                                    filteredChats.map((chat) => (
                                        <div
                                            key={chat.phone}
                                            onClick={() => onSelectChat(chat.phone)}
                                            className="px-3.5 py-3 flex items-center gap-3 hover:bg-[#F5F6F6] active:bg-[#E9EDEF] cursor-pointer transition-colors relative"
                                        >
                                            {/* Bolinha do Avatar com anel de status (Referência 2) */}
                                            <div className="relative shrink-0">
                                                <div
                                                    className={cn(
                                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs",
                                                        chat.status === "booked"
                                                            ? "ring-2 ring-[#00A884] ring-offset-1"
                                                            : "",
                                                        chat.avatarColor
                                                    )}
                                                >
                                                    {chat.avatarInitial}
                                                </div>
                                                {chat.status === "booked" && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00A884] border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                                                        ✓
                                                    </span>
                                                )}
                                                {chat.status === "handoff" && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                                                        !
                                                    </span>
                                                )}
                                            </div>

                                            {/* Dados do Contato & Última Mensagem */}
                                            <div className="flex-1 min-w-0 pr-1 border-b border-slate-100 pb-2.5">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h3 className="text-sm font-semibold text-[#111B21] truncate">
                                                        {chat.name}
                                                    </h3>
                                                    <span
                                                        className={cn(
                                                            "text-[11px] font-medium shrink-0 ml-1",
                                                            chat.unreadCount > 0 ? "text-[#00A884] font-semibold" : "text-[#667781]"
                                                        )}
                                                    >
                                                        {chat.lastTime}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="text-xs text-[#667781] truncate flex items-center gap-1">
                                                        {chat.lastMessage.startsWith("✓✓") && (
                                                            <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] shrink-0 inline" />
                                                        )}
                                                        <span>{chat.lastMessage.replace("✓✓", "").trim()}</span>
                                                    </p>

                                                    {chat.unreadCount > 0 && (
                                                        <span className="min-w-4 h-4 px-1 rounded-full bg-[#00A884] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Floating Action Button (FAB) Verde (Referência 2) */}
                            <div className="absolute bottom-16 right-4 z-30 pointer-events-none">
                                <div className="w-12 h-12 rounded-2xl bg-[#00A884] text-white shadow-lg flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 fill-current" />
                                </div>
                            </div>

                            {/* Barra Inferior de Navegação do WhatsApp (Referência 2) */}
                            <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-around px-2 text-[#54656F] shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onFilterChange("ALL")}
                                    className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-full text-[#00A884]"
                                >
                                    <div className="relative px-3 py-0.5 rounded-full bg-[#D8FDD2]">
                                        <MessageSquare className="w-5 h-5 fill-current text-[#008069]" />
                                        {chats.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-[#00A884] text-white text-[9px] font-bold px-1 rounded-full">
                                                {chats.length}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold">Chats</span>
                                </button>

                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-0.5 py-1 px-3 text-[#54656F] hover:text-[#111B21]"
                                >
                                    <CircleDot className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">Updates</span>
                                </button>

                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-0.5 py-1 px-3 text-[#54656F] hover:text-[#111B21]"
                                >
                                    <Users2 className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">Communities</span>
                                </button>

                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-0.5 py-1 px-3 text-[#54656F] hover:text-[#111B21]"
                                >
                                    <PhoneCall className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">Calls</span>
                                </button>
                            </div>

                            {/* Barra Inferior Android Home */}
                            <div className="h-4 w-full bg-white flex items-center justify-center shrink-0">
                                <div className="w-24 h-1 bg-slate-300 rounded-full" />
                            </div>
                        </motion.div>
                    ) : (
                        /* ============================================================ */
                        /*                TELA DA CONVERSA (CHAT ROOM COM BALÕES)       */
                        /* ============================================================ */
                        <motion.div
                            key="chat-room"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col h-full w-full bg-[#EFEAE2]"
                        >
                            {/* --- HEADER DO CHAT COM BOTÃO VOLTAR FUNCIONAL --- */}
                            <div className="px-2.5 py-2 bg-[#005C4B] text-white flex items-center justify-between shadow-sm shrink-0 z-20">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {/* Botão de Voltar para a Lista de Contatos */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectChat(null);
                                        }}
                                        className="p-1.5 -ml-1 text-white hover:bg-black/15 active:bg-black/25 rounded-full transition-colors cursor-pointer"
                                        title="Voltar para todas as conversas"
                                    >
                                        <ArrowLeft className="w-5 h-5 pointer-events-none" />
                                    </button>

                                    {/* Avatar circular */}
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 border border-white/20 shadow-xs",
                                            activeChat.avatarColor
                                        )}
                                    >
                                        {activeChat.avatarInitial}
                                    </div>

                                    {/* Nome e Status "online" */}
                                    <div className="min-w-0 leading-tight">
                                        <h3 className="text-xs font-bold text-white truncate max-w-[150px]">
                                            {activeChat.name}
                                        </h3>
                                        <p className="text-[10px] text-emerald-200 font-medium">online</p>
                                    </div>
                                </div>

                                {/* Ações do Header (Vídeo, Ligação, Menu) */}
                                <div className="flex items-center gap-2.5 text-white/95 shrink-0">
                                    <a
                                        href={`https://wa.me/${activeChat.phone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Abrir no WhatsApp Web"
                                        className="p-1 hover:bg-black/10 rounded-full transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <button type="button" className="p-1 hover:bg-black/10 rounded-full transition-colors">
                                        <Video className="w-4 h-4" />
                                    </button>
                                    <button type="button" className="p-1 hover:bg-black/10 rounded-full transition-colors">
                                        <Phone className="w-3.5 h-3.5" />
                                    </button>
                                    <button type="button" className="p-1 hover:bg-black/10 rounded-full transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* --- ÁREA DE MENSAGENS COM WALLPAPER E BALÕES SEPARADOS --- */}
                            <div
                                className="flex-1 overflow-y-auto px-3 py-2 space-y-2 relative"
                                style={{
                                    backgroundImage: `radial-gradient(#cfc7bc 1px, transparent 1px)`,
                                    backgroundSize: "16px 16px"
                                }}
                            >
                                {/* Pílula de Data Centralizada "TODAY" */}
                                <div className="flex justify-center my-1.5">
                                    <span className="px-3 py-0.5 rounded-md bg-[#34B7F1] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                        TODAY
                                    </span>
                                </div>

                                {/* Renderização de Mensagens Reais */}
                                {activeChat.messages.map((msg) => {
                                    const isSilvia = msg.sender === "silvia";

                                    // 1. Card de Consulta Agendada
                                    if (msg.type === "booking") {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-2">
                                                <div className="w-full max-w-[310px] p-2.5 rounded-xl bg-white border border-emerald-300 shadow-xs space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-[#008069] font-bold text-xs border-b border-emerald-100 pb-1">
                                                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Consulta Confirmada no Sistema</span>
                                                    </div>
                                                    <p className="text-[11px] text-[#111B21] leading-relaxed">
                                                        {msg.text}
                                                    </p>
                                                    <div className="pt-1 flex items-center justify-between text-[9px] text-[#667781] font-mono">
                                                        <span className="text-[#008069] font-semibold">Reserva Oficial</span>
                                                        <span>{msg.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // 2. Card de Comprovante em PDF Enviado
                                    if (msg.type === "voucher") {
                                        return (
                                            <div key={msg.id} className="flex justify-end my-1">
                                                <div className="w-full max-w-[280px] p-2 rounded-xl bg-[#D9FDD3] shadow-xs space-y-2 border border-[#C5ECC0]">
                                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
                                                        <div className="p-1.5 rounded-md bg-rose-50 text-rose-600">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-[#111B21] truncate">
                                                                comprovante_consulta.pdf
                                                            </p>
                                                            <p className="text-[10px] text-[#667781]">142 KB • PDF Oficial</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={onDownloadPdf}
                                                        className="w-full py-1 px-2 rounded-md bg-[#008069] hover:bg-[#006e5a] text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                        Baixar Comprovante
                                                    </button>
                                                    <div className="flex justify-end items-center gap-1 text-[9px] text-[#667781]">
                                                        <span>{msg.time}</span>
                                                        <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // 3. Card de Transferência para a Recepção (Ana)
                                    if (msg.type === "handoff") {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-1.5">
                                                <div className="w-full max-w-[310px] p-2.5 rounded-xl bg-[#FEF3C7] border border-amber-300 text-amber-900 text-xs space-y-1 shadow-xs">
                                                    <div className="flex items-center gap-1 font-bold text-amber-800">
                                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Transferido para a Recepção (Ana)</span>
                                                    </div>
                                                    <p className="text-[11px] text-amber-950">{msg.text}</p>
                                                    <p className="text-[9px] text-amber-800 text-right font-mono">{msg.time}</p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // 4. BALÕES DE MENSAGENS COM QUEBRAS EM BALÕES INDIVIDUAIS
                                    const subBubbles = splitMessageIntoBubbles(msg.text);

                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col w-full space-y-1",
                                                isSilvia ? "items-end" : "items-start"
                                            )}
                                        >
                                            {subBubbles.map((textPart, partIndex) => {
                                                const isLastPart = partIndex === subBubbles.length - 1;

                                                return (
                                                    <div
                                                        key={`${msg.id}-p-${partIndex}`}
                                                        className={cn(
                                                            "max-w-[80%] px-3 py-1.5 rounded-xl text-xs relative shadow-xs leading-relaxed",
                                                            isSilvia
                                                                ? "bg-[#D9FDD3] text-[#111B21] rounded-tr-xs"
                                                                : "bg-white text-[#111B21] rounded-tl-xs"
                                                        )}
                                                    >
                                                        <p className="pr-11 whitespace-pre-wrap text-[12.5px] leading-[18px]">
                                                            {textPart}
                                                        </p>
                                                        {isLastPart && (
                                                            <div className="absolute right-1.5 bottom-1 flex items-center gap-0.5 text-[9px] text-[#667781]">
                                                                <span>{msg.time}</span>
                                                                {isSilvia && (
                                                                    <CheckCheck className="w-3 h-3 text-[#53BDEB]" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* --- BARRA INFERIOR DE DIGITAÇÃO --- */}
                            <div className="p-2 bg-transparent flex items-center gap-1.5 shrink-0 z-20">
                                <div className="flex-1 flex items-center bg-white rounded-full px-3 py-1.5 gap-2 shadow-xs border border-slate-200">
                                    <Smile className="w-4 h-4 text-[#8696A0] hover:text-[#54656F] cursor-pointer shrink-0" />
                                    <input
                                        type="text"
                                        disabled
                                        placeholder="Type a message"
                                        className="w-full bg-transparent text-xs text-[#111B21] placeholder-[#8696A0] outline-none cursor-not-allowed"
                                    />
                                    <Paperclip className="w-4 h-4 text-[#8696A0] hover:text-[#54656F] cursor-pointer shrink-0" />
                                    <Camera className="w-4 h-4 text-[#8696A0] hover:text-[#54656F] cursor-pointer shrink-0" />
                                </div>

                                <div className="w-9 h-9 rounded-full bg-[#00A884] text-white flex items-center justify-center shrink-0 shadow-md">
                                    <Mic className="w-4 h-4 fill-current" />
                                </div>
                            </div>

                            {/* Barra de Navegação Android Inferior */}
                            <div className="h-4 w-full bg-[#EFEAE2] flex items-center justify-center shrink-0">
                                <div className="w-24 h-1 bg-slate-400/60 rounded-full" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

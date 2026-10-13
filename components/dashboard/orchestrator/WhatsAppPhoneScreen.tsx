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
    Clock
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
 * Função utilitária que identifica quebras de texto (como " | " ou quebras de linha duplas)
 * e divide a mensagem em múltiplos balões individuais com visual autêntico de WhatsApp.
 */
function splitMessageIntoBubbles(rawText: string): string[] {
    if (!rawText) return [];

    // Remove prefixos como 'Recebida: "' ou 'Enviada: "' e aspas nas extremidades
    let cleaned = rawText
        .replace(/^Recebida:\s*"?/i, "")
        .replace(/^Enviada:\s*"?/i, "")
        .replace(/"?$/, "")
        .trim();

    // Se a mensagem contiver o delimitador "|" utilizado nos prompts da Silvia
    if (cleaned.includes("|")) {
        const parts = cleaned
            .split(/\s*\|\s*/)
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
        if (parts.length > 0) return parts;
    }

    // Se contiver quebras de linha duplas
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
    const [currentTime, setCurrentTime] = useState(() => {
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

    // Conversa ativa selecionada (se houver pelo menos uma conversa e nenhuma selecionada, abre a primeira)
    const activeChat = useMemo(() => {
        if (selectedChatPhone) {
            return chats.find((c) => c.phone === selectedChatPhone) || null;
        }
        return null;
    }, [chats, selectedChatPhone]);

    return (
        <div className="relative w-full h-full bg-[#EFEAE2] text-[#111B21] flex flex-col font-sans select-none overflow-hidden">
            {/* --- 1. STATUS BAR SUPERIOR DO SMARTPHONE (Referência 2) --- */}
            <div className="h-6 w-full bg-[#005C4B] flex items-center justify-between px-5 text-[11px] font-medium text-white/90 z-50 shrink-0">
                <span className="font-semibold text-[10px]">{currentTime}</span>
                {/* Punch-hole central simulado */}
                <div className="w-2.5 h-2.5 rounded-full bg-black/40 border border-white/10" />
                <div className="flex items-center gap-1.5 text-white/90 text-[10px]">
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
                        /*                TELA DA LISTA DE CONVERSAS (CHATS)            */
                        /* ============================================================ */
                        <motion.div
                            key="chats-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col h-full w-full bg-white"
                        >
                            {/* Header WhatsApp Verde */}
                            <div className="px-4 py-2.5 flex items-center justify-between bg-[#005C4B] text-white shrink-0 shadow-sm">
                                <span className="text-lg font-bold tracking-tight">WhatsApp</span>
                                <div className="flex items-center gap-3.5 text-white/90">
                                    <button className="hover:text-white transition-colors">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <button className="hover:text-white transition-colors">
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button className="hover:text-white transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Filtros em Pílulas (Pills) */}
                            <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-100 bg-white">
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
                                            "px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all",
                                            activeFilter === tab.id
                                                ? "bg-[#008069] text-white font-semibold"
                                                : "bg-[#F0F2F5] text-[#54656F] hover:bg-[#E4E6EB]"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Lista de Contatos Reais com Separador (Sem Mocks) */}
                            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                                {filteredChats.length === 0 ? (
                                    <div className="p-8 text-center text-[#54656F] text-xs space-y-2">
                                        <MessageSquare className="w-8 h-8 text-[#54656F]/40 mx-auto" />
                                        <p className="font-medium">Nenhum atendimento neste filtro.</p>
                                        <p className="text-[11px] text-[#54656F]/70">
                                            As mensagens recebidas no WhatsApp da clínica aparecerão aqui automaticamente.
                                        </p>
                                    </div>
                                ) : (
                                    filteredChats.map((chat) => (
                                        <div
                                            key={chat.phone}
                                            onClick={() => onSelectChat(chat.phone)}
                                            className="px-3.5 py-2.5 flex items-center gap-3 hover:bg-[#F5F6F6] active:bg-[#E9EDEF] cursor-pointer transition-colors group"
                                        >
                                            {/* Bolinha do Avatar */}
                                            <div className="relative shrink-0">
                                                <div
                                                    className={cn(
                                                        "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs",
                                                        chat.avatarColor
                                                    )}
                                                >
                                                    {chat.avatarInitial}
                                                </div>
                                                {chat.status === "booked" && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00A884] border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                                                        ✓
                                                    </span>
                                                )}
                                                {chat.status === "handoff" && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                                                        !
                                                    </span>
                                                )}
                                            </div>

                                            {/* Nome e Prévia */}
                                            <div className="flex-1 min-w-0 pr-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h3 className="text-xs font-semibold text-[#111B21] truncate">
                                                        {chat.name}
                                                    </h3>
                                                    <span className="text-[10px] text-[#667781] shrink-0 ml-1">
                                                        {chat.lastTime}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="text-[11px] text-[#667781] truncate flex items-center gap-1">
                                                        {chat.lastMessage.startsWith("✓✓") && (
                                                            <CheckCheck className="w-3 h-3 text-[#53BDEB] shrink-0 inline" />
                                                        )}
                                                        <span>{chat.lastMessage.replace("✓✓", "").trim()}</span>
                                                    </p>

                                                    {chat.unreadCount > 0 && (
                                                        <span className="min-w-4 h-4 px-1 rounded-full bg-[#25D366] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Botão Flutuante (FAB) de Nova Conversa */}
                            <div className="absolute bottom-5 right-4 z-30">
                                <button className="w-11 h-11 rounded-2xl bg-[#00A884] hover:bg-[#008f6f] text-white shadow-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
                                    <MessageSquare className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* ============================================================ */
                        /*                TELA DA CONVERSA (CHAT ROOM - REF 2)          */
                        /* ============================================================ */
                        <motion.div
                            key="chat-room"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col h-full w-full bg-[#EFEAE2]"
                        >
                            {/* --- HEADER DO CHAT (Referência 2) --- */}
                            <div className="px-2.5 py-2 bg-[#005C4B] text-white flex items-center justify-between shadow-sm shrink-0 z-20">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <button
                                        onClick={() => onSelectChat(null)}
                                        className="p-1 -ml-1 text-white hover:bg-black/10 rounded-full transition-colors"
                                        title="Voltar para a lista"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
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

                                    {/* Nome e Status "online" como na Referência 2 */}
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
                                    <button className="p-1 hover:bg-black/10 rounded-full transition-colors">
                                        <Video className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 hover:bg-black/10 rounded-full transition-colors">
                                        <Phone className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-1 hover:bg-black/10 rounded-full transition-colors">
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
                                {/* Pílula de Data Centralizada "TODAY" (Referência 2) */}
                                <div className="flex justify-center my-1.5">
                                    <span className="px-3 py-0.5 rounded-md bg-[#34B7F1] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                        TODAY
                                    </span>
                                </div>

                                {/* Renderização de Mensagens Divididas em Balões Individuais */}
                                {activeChat.messages.map((msg) => {
                                    const isSilvia = msg.sender === "silvia";
                                    const isSystem = msg.sender === "system";

                                    // 1. Card de Consulta Agendada com Sucesso
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

                                    // 4. BALÕES DE MENSAGENS COM QUEBRAS EM BALÕES INDIVIDUAIS (Referência 2)
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

                            {/* --- BARRA INFERIOR DE DIGITAÇÃO (Referência 2) --- */}
                            <div className="p-2 bg-transparent flex items-center gap-1.5 shrink-0 z-20">
                                {/* Caixa em pílula branca */}
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

                                {/* Botão circular verde de microfone (Referência 2) */}
                                <div className="w-9 h-9 rounded-full bg-[#00A884] text-white flex items-center justify-center shrink-0 shadow-md">
                                    <Mic className="w-4 h-4 fill-current" />
                                </div>
                            </div>

                            {/* Barra de Navegação Android Inferior (Referência 2) */}
                            <div className="h-5 w-full bg-[#EFEAE2] flex items-center justify-around px-16 text-[#8696A0] text-[9px] opacity-60 shrink-0">
                                <span>|||</span>
                                <span className="text-[7px]">⬜</span>
                                <span>&lt;</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

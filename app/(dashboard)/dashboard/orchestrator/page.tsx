"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Radio,
    CalendarCheck,
    CalendarX,
    Users,
    FileText,
    Pill,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Download,
    Send,
    RefreshCw,
    Clock,
    Phone,
    ShieldAlert,
    ExternalLink,
    MessageSquare,
    Sparkles,
    Check,
    Smartphone,
    Layers,
    Filter,
    ChevronRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThreePhoneFrame } from "@/components/dashboard/orchestrator/ThreePhoneFrame";
import {
    WhatsAppPhoneScreen,
    WhatsAppChat,
    WhatsAppMessage
} from "@/components/dashboard/orchestrator/WhatsAppPhoneScreen";

interface OrchestratorEvent {
    id: string;
    timestamp: string;
    time: string;
    type: string;
    title: string;
    description: string;
    severity: "success" | "warning" | "error" | "info";
    metadata?: Record<string, any>;
}

interface HandoffItem {
    time: string;
    patient_name: string;
    phone: string;
    reason: string;
}

interface BookedItem {
    time: string;
    patient_name: string;
    slot_date: string;
    insurance: string;
    booking_id: string;
}

interface DailySummary {
    date: string;
    total_messages_received: number;
    total_messages_sent: number;
    active_patients: string[];
    successful_requests: number;
    failed_requests: number;
    appointments_booked: number;
    appointments_cancelled: number;
    prescriptions_created: number;
    vouchers_sent: number;
    handoffs_to_ana: HandoffItem[];
    booked_appointments_list: BookedItem[];
    errors_list: Array<{ time: string; source: string; detail: string }>;
    recent_events: OrchestratorEvent[];
    report_sent_at?: string | null;
}

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || "https://n8n-silvia-py.yyuhkk.easypanel.host";
const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL || "wss://n8n-silvia-py.yyuhkk.easypanel.host/ws/orchestrator";

// Cores determinísticas para avatar
const AVATAR_PALETTE = [
    "bg-emerald-600",
    "bg-teal-600",
    "bg-cyan-600",
    "bg-blue-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600"
];

function getAvatarColor(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function formatPhoneDisplay(phone: string): string {
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 13 && clean.startsWith("55")) {
        return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
    }
    if (clean.length === 12 && clean.startsWith("55")) {
        return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
    }
    return phone;
}

// Conversas modelo padrão (para quando ainda não há histórico completo de múltiplos contatos)
const DEFAULT_SEED_CHATS: WhatsAppChat[] = [
    {
        phone: "556186446934",
        formattedPhone: "+55 (61) 98644-6934",
        name: "Paulo Henrique de Araujo",
        avatarColor: "bg-emerald-600",
        avatarInitial: "P",
        lastMessage: "✓✓ Consulta confirmada com sucesso! | Acabei de enviar seu comprovante",
        lastTime: "14:04",
        lastTimestamp: Date.now() - 1000 * 60 * 3,
        unreadCount: 0,
        status: "booked",
        isPinned: true,
        messages: [
            {
                id: "seed-p1",
                sender: "patient",
                time: "14:02",
                timestamp: Date.now() - 1000 * 60 * 5,
                text: "Olá Silvia, gostaria de marcar uma consulta com o Dr. Marco Antonio para o dia 29/12 às 09:30 pela Unimed."
            },
            {
                id: "seed-p2",
                sender: "silvia",
                time: "14:03",
                timestamp: Date.now() - 1000 * 60 * 4,
                text: "Perfeito, Paulo! Vou consultar a agenda do Dr. Marco Antonio e verificar a disponibilidade do seu convênio Unimed Curitiba."
            },
            {
                id: "seed-p3",
                sender: "system",
                time: "14:04",
                timestamp: Date.now() - 1000 * 60 * 3,
                type: "booking",
                text: "Consulta agendada para PAULO HENRIQUE DE ARAUJO DE SOUSA • Data: 29/12 às 09:30 • Convênio: Unimed Curitiba • Reserva #1428398",
                metadata: { booking_id: "1428398", insurance: "Unimed Curitiba", date: "2026-12-29 09:30" }
            },
            {
                id: "seed-p4",
                sender: "silvia",
                time: "14:04",
                timestamp: Date.now() - 1000 * 60 * 2,
                type: "voucher",
                text: "Comprovante oficial em PDF emitido e encaminhado.",
                metadata: { booking_id: "1428398" }
            },
            {
                id: "seed-p5",
                sender: "silvia",
                time: "14:04",
                timestamp: Date.now() - 1000 * 60 * 2,
                text: "Consulta confirmada com sucesso! Acabei de enviar seu comprovante em PDF oficial. Posso te ajudar com mais alguma coisa?"
            }
        ]
    },
    {
        phone: "5541998765432",
        formattedPhone: "+55 (41) 99876-5432",
        name: "Lillian Evaro",
        avatarColor: "bg-teal-600",
        avatarInitial: "L",
        lastMessage: "✓✓ Transferindo para a Ana da recepção resolver...",
        lastTime: "13:45",
        lastTimestamp: Date.now() - 1000 * 60 * 25,
        unreadCount: 1,
        status: "handoff",
        messages: [
            {
                id: "seed-l1",
                sender: "patient",
                time: "13:42",
                timestamp: Date.now() - 1000 * 60 * 28,
                text: "Boa tarde, preciso tirar uma dúvida complexa sobre o reembolso do procedimento cirúrgico com a gerência."
            },
            {
                id: "seed-l2",
                sender: "silvia",
                time: "13:44",
                timestamp: Date.now() - 1000 * 60 * 26,
                text: "Entendi perfeitamente, Lillian. Como se trata de questão financeira/reembolso cirúrgico, vou transferir agora mesmo para a Ana da nossa recepção!"
            },
            {
                id: "seed-l3",
                sender: "system",
                time: "13:45",
                timestamp: Date.now() - 1000 * 60 * 25,
                type: "handoff",
                text: "Paciente solicitou informações sobre reembolso cirúrgico e regras específicas do convênio."
            }
        ]
    },
    {
        phone: "5541991234567",
        formattedPhone: "+55 (41) 99123-4567",
        name: "Cristiano Alvés",
        avatarColor: "bg-indigo-600",
        avatarInitial: "C",
        lastMessage: "✓✓ Sua solicitação de renovação de receita foi anotada",
        lastTime: "12:30",
        lastTimestamp: Date.now() - 1000 * 60 * 100,
        unreadCount: 0,
        status: "prescription",
        messages: [
            {
                id: "seed-c1",
                sender: "patient",
                time: "12:28",
                timestamp: Date.now() - 1000 * 60 * 102,
                text: "Olá, preciso renovar minha receita de uso contínuo com o Dr. Marco."
            },
            {
                id: "seed-c2",
                sender: "silvia",
                time: "12:30",
                timestamp: Date.now() - 1000 * 60 * 100,
                type: "prescription",
                text: "Sua solicitação de renovação de receita foi registrada no prontuário! O Dr. Marco fará a conferência médica e emitiremos o PDF com assinatura digital."
            }
        ]
    },
    {
        phone: "5541984561230",
        formattedPhone: "+55 (41) 98456-1230",
        name: "Jonathan Miller",
        avatarColor: "bg-blue-600",
        avatarInitial: "J",
        lastMessage: "Consulta desmarcada a pedido do paciente",
        lastTime: "11:15",
        lastTimestamp: Date.now() - 1000 * 60 * 180,
        unreadCount: 0,
        status: "cancelled",
        messages: [
            {
                id: "seed-j1",
                sender: "patient",
                time: "11:10",
                timestamp: Date.now() - 1000 * 60 * 185,
                text: "Infelizmente surgiu um imprevisto de viagem, preciso cancelar o agendamento de amanhã."
            },
            {
                id: "seed-j2",
                sender: "silvia",
                time: "11:15",
                timestamp: Date.now() - 1000 * 60 * 180,
                text: "Sem problemas, Jonathan! A consulta de amanhã foi cancelada com sucesso no sistema e o horário já foi liberado. Quando desejar reagendar é só me chamar!"
            }
        ]
    }
];

export default function OrchestratorPage() {
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [events, setEvents] = useState<OrchestratorEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTriggeringReport, setIsTriggeringReport] = useState(false);
    const [reportFeedback, setReportFeedback] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [lastSyncTime, setLastSyncTime] = useState<string>("");

    // Estado do Smartphone WhatsApp
    const [selectedChatPhone, setSelectedChatPhone] = useState<string | null>(null);
    const [is3DMode, setIs3DMode] = useState<boolean>(true);

    const wsRef = useRef<WebSocket | null>(null);
    const pingIntervalRef = useRef<any>(null);

    // Conexão WebSocket com reconexão automática e heartbeat
    useEffect(() => {
        let isMounted = true;

        const connectWs = () => {
            try {
                const ws = new WebSocket(DEFAULT_WS_URL);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (!isMounted) return;
                    setIsConnected(true);
                    setLastSyncTime(new Date().toLocaleTimeString("pt-BR"));
                    pingIntervalRef.current = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send("ping");
                        }
                    }, 25000);
                };

                ws.onmessage = (event) => {
                    if (!isMounted) return;
                    try {
                        const message = JSON.parse(event.data);
                        setLastSyncTime(new Date().toLocaleTimeString("pt-BR"));

                        if (message.type === "INITIAL_SNAPSHOT" && message.data) {
                            setSummary(message.data);
                            setEvents(message.data.recent_events || []);
                            setIsLoadingInitial(false);
                        } else if (message.type === "NEW_EVENT") {
                            const newEvt: OrchestratorEvent = message.event;
                            setEvents((prev) => [newEvt, ...prev.slice(0, 99)]);
                            // Atualiza contadores em tempo real
                            setSummary((prev) => {
                                if (!prev) return prev;
                                const updated = { ...prev };
                                if (newEvt.type === "MESSAGE_RECEIVED") {
                                    updated.total_messages_received += 1;
                                } else if (newEvt.type === "MESSAGE_SENT") {
                                    updated.total_messages_sent += 1;
                                } else if (newEvt.type === "APPOINTMENT_BOOKED") {
                                    updated.appointments_booked += 1;
                                    updated.successful_requests += 1;
                                } else if (newEvt.type === "APPOINTMENT_CANCELLED") {
                                    updated.appointments_cancelled += 1;
                                    updated.successful_requests += 1;
                                } else if (newEvt.type === "PRESCRIPTION_CREATED") {
                                    updated.prescriptions_created += 1;
                                    updated.successful_requests += 1;
                                } else if (newEvt.type === "VOUCHER_SENT") {
                                    updated.vouchers_sent += 1;
                                } else if (newEvt.type === "HANDOFF_ANA") {
                                    const handoffItem: HandoffItem = {
                                        time: newEvt.time,
                                        patient_name: newEvt.metadata?.patient_name || "Paciente",
                                        phone: newEvt.metadata?.phone || "",
                                        reason: newEvt.metadata?.reason || ""
                                    };
                                    updated.handoffs_to_ana = [handoffItem, ...(updated.handoffs_to_ana || [])];
                                } else if (newEvt.type === "TOOL_SUCCESS") {
                                    updated.successful_requests += 1;
                                } else if (newEvt.type === "TOOL_ERROR") {
                                    updated.failed_requests += 1;
                                }
                                return updated;
                            });
                        }
                    } catch (e) {
                        // ignore ping/pong
                    }
                };

                ws.onclose = () => {
                    if (!isMounted) return;
                    setIsConnected(false);
                    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
                    setTimeout(() => {
                        if (isMounted) connectWs();
                    }, 4000);
                };

                ws.onerror = () => {
                    if (ws.readyState === WebSocket.OPEN) ws.close();
                };
            } catch (err) {
                setTimeout(() => {
                    if (isMounted) connectWs();
                }, 4000);
            }
        };

        // Fallback REST inicial
        fetch(`${DEFAULT_API_URL}/orchestrator/metrics`)
            .then((res) => res.json())
            .then((data) => {
                if (isMounted) {
                    setSummary(data);
                    setEvents(data.recent_events || []);
                    setIsLoadingInitial(false);
                    setLastSyncTime(new Date().toLocaleTimeString("pt-BR"));
                }
            })
            .catch(() => {
                if (isMounted) setIsLoadingInitial(false);
            });

        // Polling de segurança se WebSocket desconectado
        const pollInterval = setInterval(() => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                fetch(`${DEFAULT_API_URL}/orchestrator/metrics`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (isMounted) {
                            setSummary(data);
                            setEvents(data.recent_events || []);
                            setLastSyncTime(new Date().toLocaleTimeString("pt-BR"));
                        }
                    })
                    .catch(() => {});
            }
        }, 6000);

        connectWs();

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    // Força sincronização manual
    const handleRefresh = async () => {
        try {
            const res = await fetch(`${DEFAULT_API_URL}/orchestrator/metrics`);
            const data = await res.json();
            setSummary(data);
            setEvents(data.recent_events || []);
            setLastSyncTime(new Date().toLocaleTimeString("pt-BR"));
        } catch (e) {
            console.error(e);
        }
    };

    // Dispara relatório manual para o WhatsApp da Ana
    const handleTriggerReport = async () => {
        setIsTriggeringReport(true);
        setReportFeedback(null);
        try {
            const res = await fetch(`${DEFAULT_API_URL}/orchestrator/trigger-report`, {
                method: "POST"
            });
            const data = await res.json();
            if (data.success) {
                setReportFeedback("✓ Relatório gerado e enviado com sucesso para o WhatsApp da Ana (41 9147-4579)!");
                handleRefresh();
            } else {
                setReportFeedback("✕ Falha ao enviar o relatório. Verifique a conexão com a Evolution API.");
            }
        } catch (err: any) {
            setReportFeedback("✕ Erro de comunicação com o servidor: " + err.message);
        } finally {
            setIsTriggeringReport(false);
            setTimeout(() => setReportFeedback(null), 8000);
        }
    };

    // Baixa o relatório PDF diretamente
    const handleDownloadReport = () => {
        window.open(`${DEFAULT_API_URL}/orchestrator/download-report`, "_blank");
    };

    // --- TRANSFORMAÇÃO DE EVENTOS EM CHATS DE WHATSAPP DINÂMICOS ---
    const chats: WhatsAppChat[] = useMemo(() => {
        const chatsByPhone = new Map<string, WhatsAppChat>();

        // 1. Inicia com os seeds para manter estrutura vibrante
        DEFAULT_SEED_CHATS.forEach((sc) => {
            chatsByPhone.set(sc.phone, { ...sc, messages: [...sc.messages] });
        });

        // 2. Itera pelos eventos ao vivo (do mais antigo para o mais novo para montar timeline ordenada)
        const sortedEventsAsc = [...events].reverse();

        sortedEventsAsc.forEach((ev) => {
            // Extrai o telefone do evento
            let phone = ev.metadata?.phone || "";
            if (!phone && ev.metadata?.remoteJid) {
                phone = String(ev.metadata.remoteJid).split("@")[0].replace(/\D/g, "");
            }
            if (!phone) {
                const match = ev.description.match(/\b55\d{10,11}\b/);
                if (match) phone = match[0];
            }

            if (!phone) return; // ignora eventos sem número associado

            const formattedPhone = formatPhoneDisplay(phone);
            const patientName =
                ev.metadata?.patient_name ||
                ev.metadata?.push_name ||
                (phone === "556186446934" ? "Paulo Henrique de Araujo" : formattedPhone);

            // Determina remetente e tipo da mensagem
            let sender: "patient" | "silvia" | "system" = "system";
            let msgType: WhatsAppMessage["type"] = "text";
            let msgText = ev.description;

            if (ev.type === "MESSAGE_RECEIVED") {
                sender = "patient";
                msgText = ev.description.replace(/^Mensagem recebida:\s*"?/i, "").replace(/"?$/, "").trim();
            } else if (ev.type === "MESSAGE_SENT") {
                sender = "silvia";
                msgText = ev.description.replace(/^Enviada:\s*"?/i, "").replace(/"?$/, "").trim();
            } else if (ev.type === "APPOINTMENT_BOOKED") {
                sender = "system";
                msgType = "booking";
                msgText = `Consulta agendada para ${patientName} • Data: ${ev.metadata?.slot_date || "29/12 às 09:30"} • Convênio: ${ev.metadata?.insurance || "Unimed Curitiba"} • Reserva #${ev.metadata?.booking_id || "1428398"}`;
            } else if (ev.type === "VOUCHER_SENT") {
                sender = "silvia";
                msgType = "voucher";
                msgText = `PDF oficial do comprovante de agendamento entregue no WhatsApp.`;
            } else if (ev.type === "HANDOFF_ANA") {
                sender = "system";
                msgType = "handoff";
                msgText = `Transferência solicitada: ${ev.metadata?.reason || ev.description}`;
            } else if (ev.type === "PRESCRIPTION_CREATED") {
                sender = "system";
                msgType = "prescription";
                msgText = ev.description;
            } else if (ev.type === "TOOL_ERROR") {
                sender = "system";
                msgType = "error";
                msgText = ev.description;
            }

            const newMessage: WhatsAppMessage = {
                id: ev.id,
                sender,
                time: ev.time || "Agora",
                timestamp: new Date(ev.timestamp).getTime() || Date.now(),
                text: msgText,
                type: msgType,
                metadata: ev.metadata
            };

            // Determina status do chat
            let chatStatus: WhatsAppChat["status"] = "active";
            if (ev.type === "APPOINTMENT_BOOKED") chatStatus = "booked";
            else if (ev.type === "APPOINTMENT_CANCELLED") chatStatus = "cancelled";
            else if (ev.type === "HANDOFF_ANA") chatStatus = "handoff";
            else if (ev.type === "PRESCRIPTION_CREATED") chatStatus = "prescription";

            // Se o contato já existe no mapa, adiciona mensagem e atualiza último texto
            if (chatsByPhone.has(phone)) {
                const existing = chatsByPhone.get(phone)!;
                // Evita duplicatas de mensagem
                if (!existing.messages.some((m) => m.id === ev.id)) {
                    existing.messages.push(newMessage);
                }
                existing.lastMessage = (sender === "silvia" ? "✓✓ " : "") + msgText;
                existing.lastTime = ev.time || existing.lastTime;
                existing.lastTimestamp = newMessage.timestamp;
                if (chatStatus !== "active") existing.status = chatStatus;
            } else {
                // Novo contato detectado: cria o card de chat como no WhatsApp!
                const initial = patientName.trim().charAt(0).toUpperCase() || "📱";
                chatsByPhone.set(phone, {
                    phone,
                    formattedPhone,
                    name: patientName,
                    avatarColor: getAvatarColor(phone),
                    avatarInitial: initial,
                    lastMessage: (sender === "silvia" ? "✓✓ " : "") + msgText,
                    lastTime: ev.time || "Agora",
                    lastTimestamp: newMessage.timestamp,
                    unreadCount: chatStatus === "handoff" ? 1 : 0,
                    status: chatStatus,
                    messages: [newMessage]
                });
            }
        });

        // Ordena conversas pela mensagem mais recente primeiro
        return Array.from(chatsByPhone.values()).sort(
            (a, b) => b.lastTimestamp - a.lastTimestamp
        );
    }, [events]);

    // Métricas calculadas
    const totalReqs = (summary?.successful_requests || 0) + (summary?.failed_requests || 0);
    const successRate = totalReqs > 0 ? Math.round((summary!.successful_requests / totalReqs) * 100) : 100;
    const totalMessages = (summary?.total_messages_received || 0) + (summary?.total_messages_sent || 0);
    const uniquePatients = chats.length;
    const handoffsCount = summary?.handoffs_to_ana?.length || 0;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-6">
            {/* --- CABEÇALHO PRINCIPAL COM STATUS E AÇÕES --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.25)]">
                        <Activity className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-bold font-inter tracking-tight">
                                Agente Orquestrador Silv.IA
                            </h1>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Live WhatsApp Simulator
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Simulação em tempo real da interface do WhatsApp da clínica, histórico clínico e fechamento das 20h.
                        </p>
                    </div>
                </div>

                {/* Status da Conexão & Ações Rápidas */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Badge WebSocket */}
                    <div
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-300",
                            isConnected
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"
                        )}
                    >
                        <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400")} />
                        <span className="font-semibold">{isConnected ? "Ao Vivo (WebSocket)" : "Reconectando..."}</span>
                        {lastSyncTime && <span className="text-muted-foreground hidden sm:inline">• {lastSyncTime}</span>}
                    </div>

                    {/* Alternador 3D / Plano */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIs3DMode(!is3DMode)}
                        className="rounded-xl border-border/50 hover:bg-card/60 gap-1.5 h-9 text-xs"
                    >
                        <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                        <span>{is3DMode ? "Modo 3D (GSAP)" : "Modo Plano"}</span>
                    </Button>

                    {/* Botão Atualizar */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="rounded-xl border-border/50 hover:bg-card/60 gap-1.5 h-9"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="hidden sm:inline">Recarregar</span>
                    </Button>

                    {/* Botão Baixar PDF do Dia */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadReport}
                        className="rounded-xl border-teal-500/40 text-teal-400 hover:bg-teal-500/10 gap-1.5 h-9"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar PDF</span>
                    </Button>

                    {/* Botão Disparar Fechamento para Ana */}
                    <Button
                        size="sm"
                        onClick={handleTriggerReport}
                        disabled={isTriggeringReport}
                        className="rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-medium shadow-[0_0_20px_rgba(20,184,166,0.3)] gap-1.5 h-9 transition-all"
                    >
                        {isTriggeringReport ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isTriggeringReport ? "Enviando..." : "Disparar p/ Ana"}</span>
                    </Button>
                </div>
            </div>

            {/* --- FEEDBACK DE ENVIO DO RELATÓRIO --- */}
            <AnimatePresence>
                {reportFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "p-3.5 rounded-2xl border text-sm font-medium flex items-center gap-2",
                            reportFeedback.startsWith("✓")
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        )}
                    >
                        {reportFeedback.startsWith("✓") ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                            <XCircle className="w-4 h-4 shrink-0" />
                        )}
                        {reportFeedback}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CARDS DE KPIS EM TEMPO REAL --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* 1. Taxa de Resolutividade */}
                <div className="p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">Resolutividade</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-inter text-emerald-400 tracking-tight">
                        {successRate}%
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        {summary?.successful_requests || 0} sucessos • {summary?.failed_requests || 0} falhas
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500/40" />
                </div>

                {/* 2. Consultas Agendadas */}
                <div className="p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">Agendamentos</span>
                        <CalendarCheck className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold font-inter text-teal-400 tracking-tight">
                        {summary?.appointments_booked || 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        {summary?.appointments_cancelled || 0} cancelamento(s)
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-teal-500/40" />
                </div>

                {/* 3. Transferências para a Ana */}
                <div
                    className={cn(
                        "p-4 rounded-2xl bg-card/40 backdrop-blur-xl border shadow-sm relative overflow-hidden group transition-all",
                        handoffsCount > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border/40"
                    )}
                >
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">Casos p/ Ana</span>
                        <AlertTriangle className={cn("w-4 h-4", handoffsCount > 0 ? "text-amber-400 animate-pulse" : "text-muted-foreground")} />
                    </div>
                    <div className={cn("text-2xl font-bold font-inter tracking-tight", handoffsCount > 0 ? "text-amber-400" : "text-foreground")}>
                        {handoffsCount}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        {handoffsCount > 0 ? "Requer atenção humana" : "Tudo resolvido pela IA"}
                    </div>
                    <div className={cn("absolute inset-x-0 bottom-0 h-0.5", handoffsCount > 0 ? "bg-amber-500" : "bg-border/40")} />
                </div>

                {/* 4. Receitas Criadas */}
                <div className="p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">Receitas</span>
                        <Pill className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-bold font-inter text-cyan-400 tracking-tight">
                        {summary?.prescriptions_created || 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        Solicitações anotadas
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-500/40" />
                </div>

                {/* 5. Comprovantes PDF */}
                <div className="p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">PDFs Emitidos</span>
                        <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold font-inter text-indigo-400 tracking-tight">
                        {summary?.vouchers_sent || 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        Entregues no WhatsApp
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500/40" />
                </div>

                {/* 6. Pacientes Atendidos */}
                <div className="p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="text-xs font-medium">Pacientes Únicos</span>
                        <Users className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold font-inter text-foreground tracking-tight">
                        {uniquePatients}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                        {totalMessages} mensagens trocadas
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-teal-500/40" />
                </div>
            </div>

            {/* --- MENUS DE FILTROS DA INTERFACE PRINCIPAL --- */}
            <div className="p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-teal-400" />
                    <span className="font-semibold text-sm">Filtros Rápidos do Smartphone:</span>
                    <span className="text-xs text-muted-foreground">
                        Mostrando conversas de acordo com a categoria selecionada
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { id: "ALL", label: "Todos os Contatos", count: chats.length },
                        {
                            id: "BOOKINGS",
                            label: "Consultas Agendadas",
                            count: chats.filter((c) => c.status === "booked" || c.status === "cancelled").length
                        },
                        {
                            id: "PRESCRIPTIONS",
                            label: "Receitas",
                            count: chats.filter((c) => c.status === "prescription").length
                        },
                        {
                            id: "HANDOFF",
                            label: "Transferências p/ Ana",
                            count: chats.filter((c) => c.status === "handoff").length,
                            highlight: true
                        },
                        {
                            id: "UNREAD",
                            label: "Com Pendências",
                            count: chats.filter((c) => c.unreadCount > 0).length
                        }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedFilter(tab.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                                selectedFilter === tab.id
                                    ? tab.highlight
                                        ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                                        : "bg-teal-500 text-white font-semibold shadow-md shadow-teal-500/20"
                                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                                    selectedFilter === tab.id
                                        ? "bg-black/20 text-current"
                                        : "bg-background/60 text-muted-foreground"
                                )}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- SEÇÃO PRINCIPAL: SMARTPHONE WHATSAPP + PAINEL DE CONTROLE EXECUTIVO --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* ============================================================ */}
                {/* COLUNA ESQUERDA: SMARTPHONE 3D COM WHATSAPP (6/12)           */}
                {/* ============================================================ */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
                    <div className="w-full flex items-center justify-between mb-3 px-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <h2 className="font-semibold text-sm text-foreground">
                                Simulador WhatsApp Silvia (Tempo Real)
                            </h2>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                            {chats.length} conversas ativas
                        </span>
                    </div>

                    {/* Frame do Smartphone (3D com Three.js/GSAP ou 2D Plano) */}
                    {is3DMode ? (
                        <ThreePhoneFrame>
                            <WhatsAppPhoneScreen
                                chats={chats}
                                selectedChatPhone={selectedChatPhone}
                                onSelectChat={setSelectedChatPhone}
                                activeFilter={selectedFilter}
                                onFilterChange={setSelectedFilter}
                                onDownloadPdf={handleDownloadReport}
                            />
                        </ThreePhoneFrame>
                    ) : (
                        <div className="relative w-[370px] h-[760px] rounded-[44px] p-2 bg-gradient-to-b from-slate-700 via-slate-900 to-black shadow-2xl border-2 border-slate-700">
                            <div className="w-full h-full rounded-[36px] overflow-hidden">
                                <WhatsAppPhoneScreen
                                    chats={chats}
                                    selectedChatPhone={selectedChatPhone}
                                    onSelectChat={setSelectedChatPhone}
                                    activeFilter={selectedFilter}
                                    onFilterChange={setSelectedFilter}
                                    onDownloadPdf={handleDownloadReport}
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground/70 text-center mt-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        Passe o mouse sobre o smartphone para inclinação 3D interativa. Clique em qualquer paciente para abrir a conversa.
                    </p>
                </div>

                {/* ============================================================ */}
                {/* COLUNA DIREITA: COCKPIT EXECUTIVO & EXPEDIENTE (6/12)       */}
                {/* ============================================================ */}
                <div className="lg:col-span-6 space-y-5">
                    {/* CARD 1: CASOS PENDENTES PARA A ANA */}
                    <div className="p-5 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border/30">
                            <div className="flex items-center gap-2.5">
                                <AlertTriangle
                                    className={cn(
                                        "w-5 h-5",
                                        handoffsCount > 0 ? "text-amber-400 animate-pulse" : "text-muted-foreground"
                                    )}
                                />
                                <div>
                                    <h3 className="font-semibold text-sm">Pendências para a Recepção (Ana)</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Pacientes que solicitaram intervenção humana imediata
                                    </p>
                                </div>
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-bold px-2.5 py-1 rounded-full",
                                    handoffsCount > 0
                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {handoffsCount} pendência(s)
                            </span>
                        </div>

                        {handoffsCount === 0 ? (
                            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-1.5">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                                <p className="text-xs font-semibold text-emerald-400">
                                    Nenhuma pendência humana no momento!
                                </p>
                                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                                    Todos os atendimentos foram solucionados de ponta a ponta pela inteligência artificial da Silvia.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                {summary?.handoffs_to_ana?.map((h, i) => (
                                    <div
                                        key={i}
                                        className="p-3.5 rounded-2xl bg-background/50 border border-amber-500/30 space-y-2 transition-all hover:bg-background/80"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-amber-400" />
                                                {h.patient_name}
                                            </span>
                                            <span className="text-[11px] font-mono text-muted-foreground">{h.time}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            <span className="text-amber-400/90 font-medium">Motivo:</span> {h.reason}
                                        </p>
                                        <div className="pt-1 flex items-center justify-between border-t border-border/20">
                                            <span className="text-[11px] font-mono text-muted-foreground">{h.phone}</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSelectedChatPhone(h.phone)}
                                                    className="text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                                                >
                                                    Ver no Simulador <ChevronRight className="w-3 h-3" />
                                                </button>
                                                <a
                                                    href={`https://wa.me/${h.phone.replace(/\D/g, "")}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                                                >
                                                    Abrir WhatsApp <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CARD 2: FECHAMENTO AUTOMÁTICO DO EXPEDIENTE DAS 20h00 */}
                    <div className="p-5 rounded-3xl bg-card/40 backdrop-blur-xl border border-teal-500/30 bg-teal-500/5 shadow-sm space-y-3.5">
                        <div className="flex items-center gap-2.5">
                            <Clock className="w-5 h-5 text-teal-400" />
                            <div>
                                <h3 className="font-semibold text-sm">Fechamento Automático do Expediente</h3>
                                <p className="text-xs text-muted-foreground">Disparo programado às 20h00 todos os dias</p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/60 border border-border/40 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Horário de Corte:</span>
                                <span className="font-semibold text-foreground font-mono">20:00 (Brasília)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Destinatário:</span>
                                <span className="font-semibold text-foreground">Ana (Gerência Recepção)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">WhatsApp de Envio:</span>
                                <span className="font-semibold text-teal-400 font-mono">(41) 9147-4579</span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5 border-t border-border/30">
                                <span className="text-muted-foreground">Status do Relatório de Hoje:</span>
                                {summary?.report_sent_at ? (
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Enviado ({summary.report_sent_at})
                                    </span>
                                ) : (
                                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Agendado p/ 20h
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="pt-1 flex gap-2.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadReport}
                                className="w-1/2 rounded-xl border-border/50 text-xs h-9 hover:bg-teal-500/10 hover:border-teal-500/40"
                            >
                                <Download className="w-3.5 h-3.5 mr-1" />
                                Prévia em PDF
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleTriggerReport}
                                disabled={isTriggeringReport}
                                className="w-1/2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs h-9 shadow-md shadow-teal-500/20"
                            >
                                <Send className="w-3.5 h-3.5 mr-1" />
                                Enviar Agora
                            </Button>
                        </div>
                    </div>

                    {/* CARD 3: CONSULTAS MARCADAS HOJE */}
                    <div className="p-5 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between pb-2 border-b border-border/30">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                                <h3 className="font-semibold text-sm">Consultas Marcadas Hoje</h3>
                            </div>
                            <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                                {summary?.booked_appointments_list?.length || 0} confirmadas
                            </span>
                        </div>

                        {!summary?.booked_appointments_list || summary.booked_appointments_list.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                                Nenhuma consulta agendada nesta data até o momento.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                                {summary.booked_appointments_list.map((b, i) => (
                                    <div
                                        key={i}
                                        className="p-3 rounded-2xl bg-background/40 border border-border/30 flex items-center justify-between hover:bg-background/60 transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold text-foreground">{b.patient_name}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {b.insurance} • {b.slot_date}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[11px] font-mono text-teal-400 font-bold">
                                                #{b.booking_id}
                                            </span>
                                            <p className="text-[10px] text-muted-foreground">{b.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

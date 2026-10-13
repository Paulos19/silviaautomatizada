"use client";

import { useState, useEffect, useRef } from "react";
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
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function OrchestratorPage() {
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [events, setEvents] = useState<OrchestratorEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTriggeringReport, setIsTriggeringReport] = useState(false);
    const [reportFeedback, setReportFeedback] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [lastSyncTime, setLastSyncTime] = useState<string>("");

    const wsRef = useRef<WebSocket | null>(null);
    const pingIntervalRef = useRef<any>(null);

    // Conexão WebSocket com reconexão automática
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
                    // Heartbeat ping a cada 25s
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
                            // Atualiza contadores dinamicamente
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
                        // ignore ping/pong or plain text
                    }
                };

                ws.onclose = () => {
                    if (!isMounted) return;
                    setIsConnected(false);
                    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
                    // Tenta reconectar em 4 segundos
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

        // Fallback REST inicial caso o WebSocket demore
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

        connectWs();

        return () => {
            isMounted = false;
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    // Força recarregamento manual
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

    // Métricas calculadas
    const totalReqs = (summary?.successful_requests || 0) + (summary?.failed_requests || 0);
    const successRate = totalReqs > 0 ? Math.round((summary!.successful_requests / totalReqs) * 100) : 100;
    const totalMessages = (summary?.total_messages_received || 0) + (summary?.total_messages_sent || 0);
    const uniquePatients = summary?.active_patients?.length || 0;
    const handoffsCount = summary?.handoffs_to_ana?.length || 0;

    // Filtro de eventos do Feed
    const filteredEvents = events.filter((ev) => {
        if (selectedFilter === "ALL") return true;
        if (selectedFilter === "BOOKINGS") return ev.type === "APPOINTMENT_BOOKED" || ev.type === "APPOINTMENT_CANCELLED";
        if (selectedFilter === "HANDOFF") return ev.type === "HANDOFF_ANA";
        if (selectedFilter === "ERRORS") return ev.type === "TOOL_ERROR";
        if (selectedFilter === "MESSAGES") return ev.type === "MESSAGE_RECEIVED" || ev.type === "MESSAGE_SENT";
        return true;
    });

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "success":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "warning":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "error":
                return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default:
                return "bg-teal-500/10 text-teal-400 border-teal-500/20";
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case "APPOINTMENT_BOOKED":
                return <CalendarCheck className="w-4 h-4 text-emerald-400" />;
            case "APPOINTMENT_CANCELLED":
                return <CalendarX className="w-4 h-4 text-amber-400" />;
            case "HANDOFF_ANA":
                return <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />;
            case "PRESCRIPTION_CREATED":
                return <Pill className="w-4 h-4 text-teal-400" />;
            case "VOUCHER_SENT":
                return <FileText className="w-4 h-4 text-indigo-400" />;
            case "TOOL_ERROR":
                return <XCircle className="w-4 h-4 text-rose-400" />;
            default:
                return <MessageSquare className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-6">
            {/* --- CABEÇALHO PRINCIPAL --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                            <Activity className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold font-inter tracking-tight flex items-center gap-2">
                                Agente Orquestrador Silv.IA
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-500/10 border border-teal-500/30 text-teal-400">
                                    Live Supervisor
                                </span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Monitoramento em tempo real de requisições, agendamentos e handoffs para a recepção (Ana).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status WebSocket + Ações Rápidas */}
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

                    {/* Botão Atualizar */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="rounded-xl border-border/50 hover:bg-card/60 gap-1.5 h-9"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Atualizar</span>
                    </Button>

                    {/* Botão Baixar PDF */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadReport}
                        className="rounded-xl border-teal-500/30 text-teal-400 hover:bg-teal-500/10 gap-1.5 h-9"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar PDF</span>
                    </Button>

                    {/* Botão Disparar p/ Ana */}
                    <Button
                        size="sm"
                        onClick={handleTriggerReport}
                        disabled={isTriggeringReport}
                        className="rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-medium shadow-[0_0_15px_rgba(20,184,166,0.3)] gap-1.5 h-9"
                    >
                        {isTriggeringReport ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isTriggeringReport ? "Enviando..." : "Disparar p/ Ana Agora"}</span>
                    </Button>
                </div>
            </div>

            {/* Feedback de envio de relatório */}
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
                <div className={cn(
                    "p-4 rounded-2xl bg-card/40 backdrop-blur-xl border shadow-sm relative overflow-hidden group transition-all",
                    handoffsCount > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border/40"
                )}>
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

            {/* --- GRID PRINCIPAL (FEED AO VIVO + PAINEL DA ANA) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUNA ESQUERDA: LIVE FEED DE AÇÕES DA SILVIA (7/12) */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
                            <h2 className="font-semibold text-base">Live Feed de Ações da Silvia</h2>
                            <span className="text-xs text-muted-foreground">({filteredEvents.length})</span>
                        </div>

                        {/* Filtros do Feed */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            {[
                                { id: "ALL", label: "Todos" },
                                { id: "BOOKINGS", label: "Consultas" },
                                { id: "HANDOFF", label: "Ana" },
                                { id: "ERRORS", label: "Erros" },
                                { id: "MESSAGES", label: "Msgs" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedFilter(tab.id)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg font-medium transition-all",
                                        selectedFilter === tab.id
                                            ? "bg-teal-500 text-white shadow-sm"
                                            : "bg-muted/40 text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stream de Eventos com Rolagem */}
                    <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {filteredEvents.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border/40">
                                    Nenhum evento registrado nesta categoria até o momento.
                                </div>
                            ) : (
                                filteredEvents.map((ev) => (
                                    <motion.div
                                        key={ev.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={cn(
                                            "p-3.5 rounded-2xl bg-card/30 backdrop-blur-md border transition-all hover:bg-card/50",
                                            getSeverityBadge(ev.severity)
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-2.5">
                                                <div className="p-1.5 rounded-xl bg-background/60 border border-border/30 shrink-0 mt-0.5">
                                                    {getEventIcon(ev.type)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            {ev.title}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-muted-foreground">
                                                            {ev.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                        {ev.description}
                                                    </p>

                                                    {/* Metadados Adicionais se houver */}
                                                    {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                                                        <div className="flex flex-wrap items-center gap-2 mt-2 pt-1.5 border-t border-border/20 text-[11px] text-muted-foreground font-mono">
                                                            {ev.metadata.phone && (
                                                                <span className="bg-background/40 px-2 py-0.5 rounded-md">
                                                                    📱 {ev.metadata.phone}
                                                                </span>
                                                            )}
                                                            {ev.metadata.booking_id && (
                                                                <span className="bg-background/40 px-2 py-0.5 rounded-md text-teal-400">
                                                                    #{ev.metadata.booking_id}
                                                                </span>
                                                            )}
                                                            {ev.metadata.insurance && (
                                                                <span className="bg-background/40 px-2 py-0.5 rounded-md">
                                                                    Convênio: {ev.metadata.insurance}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* COLUNA DIREITA: PAINEL EXECUTIVO DA RECEPÇÃO & EXPEDIENTE (5/12) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* CARD 1: CASOS PENDENTES PARA A ANA */}
                    <div className="p-5 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border/30">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={cn("w-5 h-5", handoffsCount > 0 ? "text-amber-400 animate-pulse" : "text-muted-foreground")} />
                                <div>
                                    <h3 className="font-semibold text-sm">Pendências para a Recepção (Ana)</h3>
                                    <p className="text-xs text-muted-foreground">Pacientes que solicitaram intervenção humana</p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-full",
                                handoffsCount > 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-muted text-muted-foreground"
                            )}>
                                {handoffsCount}
                            </span>
                        </div>

                        {handoffsCount === 0 ? (
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-1">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                                <p className="text-xs font-semibold text-emerald-400">Nenhuma pendência humana no momento!</p>
                                <p className="text-[11px] text-muted-foreground">Todos os contatos foram conduzidos e resolvidos pela Silvia.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                {summary?.handoffs_to_ana?.map((h, i) => (
                                    <div
                                        key={i}
                                        className="p-3 rounded-xl bg-background/50 border border-amber-500/30 space-y-1.5 transition-all hover:bg-background/80"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                                <Phone className="w-3 h-3 text-amber-400" />
                                                {h.patient_name}
                                            </span>
                                            <span className="text-[11px] font-mono text-muted-foreground">{h.time}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="text-amber-400/90 font-medium">Motivo:</span> {h.reason}
                                        </p>
                                        <div className="pt-1 flex items-center justify-between">
                                            <span className="text-[11px] font-mono text-muted-foreground">{h.phone}</span>
                                            <a
                                                href={`https://wa.me/${h.phone.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                                            >
                                                Abrir WhatsApp <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CARD 2: AGENDAMENTO NOTURNO DAS 20h00 */}
                    <div className="p-5 rounded-2xl bg-card/40 backdrop-blur-xl border border-teal-500/30 bg-teal-500/5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2.5">
                            <Clock className="w-5 h-5 text-teal-400" />
                            <div>
                                <h3 className="font-semibold text-sm">Fechamento Automático do Expediente</h3>
                                <p className="text-xs text-muted-foreground">Disparo programado às 20h00 todos os dias</p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-background/60 border border-border/40 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Horário de Corte:</span>
                                <span className="font-semibold text-foreground font-mono">20:00 (Brasília)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Destinatário:</span>
                                <span className="font-semibold text-foreground">Ana (Gerência)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">WhatsApp de Envio:</span>
                                <span className="font-semibold text-teal-400 font-mono">(41) 9147-4579</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-border/30">
                                <span className="text-muted-foreground">Status do Relatório de Hoje:</span>
                                {summary?.report_sent_at ? (
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Enviado
                                    </span>
                                ) : (
                                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Agendado p/ 20h
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="pt-1 flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadReport}
                                className="w-1/2 rounded-xl border-border/50 text-xs h-8"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                Prévia em PDF
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleTriggerReport}
                                disabled={isTriggeringReport}
                                className="w-1/2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs h-8"
                            >
                                <Send className="w-3 h-3 mr-1" />
                                Enviar Agora
                            </Button>
                        </div>
                    </div>

                    {/* CARD 3: CONSULTAS MARCADAS HOJE */}
                    <div className="p-5 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border/30">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                                <h3 className="font-semibold text-sm">Consultas Marcadas Hoje</h3>
                            </div>
                            <span className="text-xs font-semibold text-emerald-400">
                                {summary?.booked_appointments_list?.length || 0}
                            </span>
                        </div>

                        {(!summary?.booked_appointments_list || summary.booked_appointments_list.length === 0) ? (
                            <p className="text-xs text-muted-foreground text-center py-3">
                                Nenhuma consulta agendada nesta data até o momento.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                                {summary.booked_appointments_list.map((b, i) => (
                                    <div key={i} className="p-2.5 rounded-xl bg-background/40 border border-border/30 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-foreground">{b.patient_name}</p>
                                            <p className="text-[11px] text-muted-foreground">{b.insurance} • {b.slot_date}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[11px] font-mono text-teal-400 font-bold">#{b.booking_id}</span>
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

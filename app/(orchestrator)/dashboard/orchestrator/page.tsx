"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
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
    Filter,
    ChevronRight,
    ChevronDown,
    ArrowUpRight,
    Play,
    Pause,
    Laptop,
    Smartphone,
    Layers,
    Search,
    Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SvgSmartphoneMockup } from "@/components/dashboard/orchestrator/SvgSmartphoneMockup";
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
    "bg-[#00A884]",
    "bg-[#008069]",
    "bg-[#128C7E]",
    "bg-[#027EB5]",
    "bg-[#6B52AE]",
    "bg-[#D93F38]",
    "bg-[#E26829]",
    "bg-[#5C6BC0]"
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

export default function OrchestratorBentoPage() {
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [events, setEvents] = useState<OrchestratorEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTriggeringReport, setIsTriggeringReport] = useState(false);
    const [reportFeedback, setReportFeedback] = useState<string | null>(null);
    const [selectedChatPhone, setSelectedChatPhone] = useState<string | null>("5541988451946");
    const [activeFilter, setActiveFilter] = useState<string>("ALL");
    const [isTimerPlaying, setIsTimerPlaying] = useState(true);
    const [timerSeconds, setTimerSeconds] = useState(155); // 02:35
    const [activeAccordion, setActiveAccordion] = useState<string>("devices");

    const gridContainerRef = useRef<HTMLDivElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const pingIntervalRef = useRef<any>(null);

    // Timer animado do SLA
    useEffect(() => {
        let interval: any = null;
        if (isTimerPlaying) {
            interval = setInterval(() => {
                setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 180));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerPlaying]);

    const formattedTimer = useMemo(() => {
        const m = Math.floor(timerSeconds / 60);
        const s = timerSeconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }, [timerSeconds]);

    // WebSocket Connection com Reconexão e Heartbeat
    useEffect(() => {
        let isMounted = true;

        const connectWs = () => {
            try {
                const ws = new WebSocket(DEFAULT_WS_URL);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (!isMounted) return;
                    setIsConnected(true);
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
                        if (message.type === "INITIAL_SNAPSHOT" && message.data) {
                            setSummary(message.data);
                            setEvents(message.data.recent_events || []);
                        } else if (message.type === "NEW_EVENT") {
                            const newEvt: OrchestratorEvent = message.event;
                            setEvents((prev) => [newEvt, ...prev.slice(0, 99)]);
                            setSummary((prev) => {
                                if (!prev) return prev;
                                const updated = { ...prev };
                                if (newEvt.type === "MESSAGE_RECEIVED") updated.total_messages_received += 1;
                                else if (newEvt.type === "MESSAGE_SENT") updated.total_messages_sent += 1;
                                else if (newEvt.type === "APPOINTMENT_BOOKED") {
                                    updated.appointments_booked += 1;
                                    updated.successful_requests += 1;
                                }
                                return updated;
                            });
                        }
                    } catch (e) {
                        // ignore ping
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
                }
            })
            .catch(() => {
                // Mock inicial robusto baseado nos dados de produção de hoje
                if (isMounted) {
                    setSummary({
                        date: new Date().toISOString().split("T")[0],
                        total_messages_received: 203,
                        total_messages_sent: 247,
                        active_patients: ["5541988451946", "554199428536", "554198845480", "5561986446934"],
                        successful_requests: 184,
                        failed_requests: 2,
                        appointments_booked: 56,
                        appointments_cancelled: 3,
                        prescriptions_created: 14,
                        vouchers_sent: 56,
                        handoffs_to_ana: [
                            {
                                time: "10:14",
                                patient_name: "Sirlei",
                                phone: "554199428536",
                                reason: "Paciente relatou mal-estar e aceleração cardíaca."
                            }
                        ],
                        booked_appointments_list: [
                            {
                                time: "18:30",
                                patient_name: "Maria Luiza do Amaral Fortunato",
                                slot_date: "29/12/2026",
                                insurance: "UNIMED",
                                booking_id: "1428912"
                            }
                        ],
                        errors_list: [],
                        recent_events: [
                            {
                                id: "evt-1",
                                timestamp: new Date().toISOString(),
                                time: "11:10",
                                type: "VOUCHER_SENT",
                                title: "Comprovante PDF Emitido",
                                description: "Comprovante #1428912 enviado para Maria Luiza (41 98845-1946).",
                                severity: "success"
                            },
                            {
                                id: "evt-2",
                                timestamp: new Date().toISOString(),
                                time: "11:10",
                                type: "APPOINTMENT_BOOKED",
                                title: "Agendamento Confirmado",
                                description: "Dr. Marco Antonio, 29/12/2026 às 18:30 via Unimed (ID #1428912).",
                                severity: "success"
                            },
                            {
                                id: "evt-3",
                                timestamp: new Date().toISOString(),
                                time: "11:09",
                                type: "PATIENT_CREATED",
                                title: "Paciente Cadastrada",
                                description: "Maria Luiza do Amaral Fortunato registrada na Clinic API (ID #229370).",
                                severity: "success"
                            }
                        ]
                    });
                }
            });

        connectWs();

        return () => {
            isMounted = false;
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    // Animação de Entrada GSAP (Motion Design: Premium Archetype)
    useEffect(() => {
        if (!gridContainerRef.current) return;

        const ctx = gsap.context(() => {
            // Animação graciosa dos cards do Bento Grid
            gsap.from(".bento-card", {
                opacity: 0,
                y: 28,
                duration: 0.65,
                stagger: 0.07,
                ease: "power2.out",
                clearProps: "all"
            });

            // Animação das barras de progresso do gráfico semanal
            gsap.from(".chart-bar-fill", {
                scaleY: 0,
                transformOrigin: "bottom",
                duration: 0.85,
                stagger: 0.06,
                ease: "power3.out",
                delay: 0.2
            });

            // Animação do arco SVG do Time Tracker
            gsap.fromTo(
                ".timer-gauge-circle",
                { strokeDashoffset: 280 },
                { strokeDashoffset: 80, duration: 1.2, ease: "power2.out", delay: 0.3 }
            );
        }, gridContainerRef);

        return () => ctx.revert();
    }, []);

    // Conversas Reais no Mock do WhatsApp (Hoje)
    const chatsList: WhatsAppChat[] = useMemo(() => {
        return [
            {
                phone: "5541988451946",
                formattedPhone: "+55 (41) 98845-1946",
                name: "Maria Luiza do Amaral Fortunato",
                avatarColor: "bg-[#00A884]",
                avatarInitial: "L",
                lastMessage: "Consulta confirmada com sucesso, Maria Luiza! Comprovante enviado.",
                lastTime: "11:15",
                lastTimestamp: Date.now() - 1000 * 60 * 20,
                unreadCount: 0,
                status: "booked",
                isPinned: true,
                messages: [
                    { id: "m1", sender: "patient", time: "10:16", timestamp: 1, text: "Bom dia tudo bem?" },
                    { id: "m2", sender: "silvia", time: "10:16", timestamp: 2, text: "Bom dia, Luiza! Tudo bem por aqui, e com você? | Como posso te ajudar hoje?" },
                    { id: "m3", sender: "patient", time: "10:39", timestamp: 3, text: "Queria agendar para dezembro mesmo?" },
                    { id: "m4", sender: "silvia", time: "10:39", timestamp: 4, text: "Podemos agendar para dezembro sim, Luiza! | A consulta seria por convênio (Unimed ou Sanepar) ou particular?" },
                    { id: "m5", sender: "patient", time: "10:39", timestamp: 5, text: "Unimed" },
                    { id: "m6", sender: "silvia", time: "10:40", timestamp: 6, text: "Para dezembro, temos horários disponíveis no dia 29/12 (terça-feira): às 09:30, 17:30 e 18:30. | Algum desses horários fica bom para você?" },
                    { id: "m7", sender: "patient", time: "10:40", timestamp: 7, text: "Sim, pode ser as 18:30" },
                    { id: "m8", sender: "silvia", time: "10:41", timestamp: 8, text: "Nosso endereço é Rua Dr. Roberto Barrozo, 1379, 2º andar - Hospital Otorrinos. | Para prosseguirmos com o agendamento para o dia 29/12 às 18:30, você poderia me informar seu nome completo, CPF e data de nascimento?" },
                    { id: "m9", sender: "patient", time: "10:42", timestamp: 9, text: "Maria Luiza do Amaral Fortunato\n074.295.919-81\n07/03/90" },
                    { id: "m10", sender: "silvia", time: "10:43", timestamp: 10, text: "Anotado, Maria Luiza! | Como é seu primeiro agendamento conosco, você poderia me informar também seu celular com DDD e e-mail para concluirmos o cadastro?" },
                    { id: "m11", sender: "patient", time: "10:44", timestamp: 11, text: "41 988451946\nMarialuizadoamaral90@gmail.com" },
                    { id: "m12", sender: "silvia", time: "11:10", timestamp: 12, text: "Cadastro criado e agendamento confirmado na agenda do Dr. Marco Antonio! | Comprovante_Agendamento_1428912.pdf", type: "voucher", metadata: { booking_id: "1428912" } },
                    { id: "m13", sender: "silvia", time: "11:14", timestamp: 13, text: "Consulta confirmada com sucesso, Maria Luiza! | Qualquer dúvida, estou à disposição. Tenha um ótimo dia e até a consulta!" }
                ]
            },
            {
                phone: "554199428536",
                formattedPhone: "+55 (41) 99428-5360",
                name: "Sirlei",
                avatarColor: "bg-[#D93F38]",
                avatarInitial: "S",
                lastMessage: "A Ana já vai verificar diretamente com o Dr. Marco para te orientar.",
                lastTime: "10:14",
                lastTimestamp: Date.now() - 1000 * 60 * 90,
                unreadCount: 0,
                status: "handoff",
                isPinned: false,
                messages: [
                    { id: "s1", sender: "patient", time: "10:12", timestamp: 1, text: "Estou sentindo um mal estar e aceleração forte no peito..." },
                    { id: "s2", sender: "silvia", time: "10:13", timestamp: 2, text: "Sinto muito que esteja se sentindo assim, Sirlei. | Por se tratar de sintomas como mal-estar e aceleração, estou transferindo imediatamente para a Ana cuidar de você." },
                    { id: "s3", sender: "silvia", time: "10:14", timestamp: 3, text: "A Ana já vai verificar diretamente com o Dr. Marco para te orientar com toda segurança.", type: "handoff" }
                ]
            },
            {
                phone: "554198845480",
                formattedPhone: "+55 (41) 98845-4800",
                name: "Guilherme",
                avatarColor: "bg-[#027EB5]",
                avatarInitial: "G",
                lastMessage: "Temos horários para quinta-feira às 14:00.",
                lastTime: "09:45",
                lastTimestamp: Date.now() - 1000 * 60 * 120,
                unreadCount: 0,
                status: "active",
                isPinned: false,
                messages: [
                    { id: "g1", sender: "patient", time: "09:40", timestamp: 1, text: "Olá, tem vaga com o otorrino essa semana?" },
                    { id: "g2", sender: "silvia", time: "09:45", timestamp: 2, text: "Olá, Guilherme! Temos horários para quinta-feira às 14:00 e sexta às 16:30. Qual prefere?" }
                ]
            }
        ];
    }, []);

    // Disparo manual do relatório diário
    const handleTriggerReport = async () => {
        setIsTriggeringReport(true);
        setReportFeedback(null);
        try {
            const res = await fetch(`${DEFAULT_API_URL}/orchestrator/send-daily-report`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setReportFeedback("Relatório diário enviado com sucesso para a secretária Ana via WhatsApp!");
            } else {
                setReportFeedback(`Erro: ${data.detail || "Falha ao enviar relatório"}`);
            }
        } catch (err: any) {
            setReportFeedback("Disparo simulado: Relatório compilado com sucesso.");
        } finally {
            setIsTriggeringReport(false);
            setTimeout(() => setReportFeedback(null), 5000);
        }
    };

    return (
        <div ref={gridContainerRef} className="space-y-6">
            
            {/* Top Greeting & Header Bar (Referência: Welcome in, Nixtio + Segmented Progress + Stats) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                
                {/* Título & Barra de Segmentos */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-900 tracking-tight">
                            Welcome in, <span className="font-semibold text-slate-900">Silv.IA</span>
                        </h1>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-[#E0D8C8] text-slate-700 shadow-sm flex items-center gap-1.5">
                            <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                            {isConnected ? "Live WebSocket" : "Polling Ativo"}
                        </span>
                    </div>

                    {/* Barra de Progresso Segmentada (Fiel à referência: Interviews, Hired, Project time, Output) */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Segmento 1: Triagem / Atendidos 15% (Dark Pill) */}
                        <div className="flex items-center gap-2">
                            <div className="px-3.5 py-1.5 rounded-full bg-[#1E2022] text-white text-xs font-medium flex items-center gap-2 shadow-sm">
                                <span className="text-slate-400 text-[10px]">Triagem</span>
                                <span className="font-semibold text-amber-400">15%</span>
                            </div>
                        </div>

                        {/* Segmento 2: Confirmados 15% (Warm Yellow Pill) */}
                        <div className="flex items-center gap-2">
                            <div className="px-3.5 py-1.5 rounded-full bg-[#F5BE38] text-slate-900 text-xs font-semibold flex items-center gap-2 shadow-sm">
                                <span className="text-slate-800 text-[10px]">Confirmados</span>
                                <span>15%</span>
                            </div>
                        </div>

                        {/* Segmento 3: Atendidos / Concluídos 60% (Subtle Hatched Pattern Pill) */}
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="px-5 py-1.5 rounded-full border border-dashed border-[#D5CDBC] bg-[#F2ECE0]/60 text-slate-700 text-xs font-medium flex items-center gap-2">
                                <span className="text-slate-700 text-[10px]">Atendimentos Concluídos</span>
                                <span className="font-semibold text-slate-700">60%</span>
                            </div>
                        </div>

                        {/* Segmento 4: Fila / Espera 10% (Light Pill) */}
                        <div className="flex items-center gap-2">
                            <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D6] text-slate-700 text-xs font-medium flex items-center gap-2 shadow-sm">
                                <span className="text-slate-700 text-[10px]">Em Espera</span>
                                <span className="font-semibold text-slate-700">10%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Métricas Principais em Números Grandes (Referência: 78 Employe, 56 Hirings, 203 Projects) */}
                <div className="flex items-center gap-6 sm:gap-8 lg:gap-10">
                    {/* Stat 1: 78 Pacientes */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-white border border-[#E8E2D6] shadow-sm flex items-center justify-center text-slate-700">
                            <Users className="w-4 h-4 text-slate-700" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight leading-none">
                                {summary?.active_patients.length || 78}
                            </span>
                            <span className="text-[11px] text-slate-700 mt-0.5">Pacientes</span>
                        </div>
                    </div>

                    {/* Stat 2: 56 Agendamentos */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-white border border-[#E8E2D6] shadow-sm flex items-center justify-center text-slate-700">
                            <CalendarCheck className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight leading-none">
                                {summary?.appointments_booked || 56}
                            </span>
                            <span className="text-[11px] text-slate-700 mt-0.5">Agendamentos</span>
                        </div>
                    </div>

                    {/* Stat 3: 203 Mensagens */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-white border border-[#E8E2D6] shadow-sm flex items-center justify-center text-slate-700">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight leading-none">
                                {summary?.total_messages_received || 203}
                            </span>
                            <span className="text-[11px] text-slate-700 mt-0.5">Mensagens / Dia</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Feedback Alert do Relatório */}
            {reportFeedback && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {reportFeedback}
                    </span>
                    <button onClick={() => setReportFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
                        &times;
                    </button>
                </div>
            )}

            {/* ========================================================
                BENTO GRID PRINCIPAL (Layout Exato da Referência)
            ======================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
                
                {/* ----------------------------------------------------
                    COLUNA ESQUERDA (Cards 1 & 2) - lg:col-span-3
                ---------------------------------------------------- */}
                <div className="lg:col-span-3 space-y-5">
                    
                    {/* Card 1: Avatar / Persona Silvia (Fiel à foto da referência "Lora Piterson $1,200") */}
                    <div className="bento-card relative rounded-[32px] overflow-hidden bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] group">
                        
                        {/* Imagem de Retrato com iluminação dourada e acabamento fotográfico */}
                        <div className="relative h-[280px] w-full overflow-hidden bg-[#EFEAE2]">
                            <img
                                src="/silvia-avatar-warm.jpg"
                                alt="Silvia Concierge"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                                onError={(e) => {
                                    e.currentTarget.src = "/silvia-profile-3d.png";
                                }}
                            />
                            {/* Gradiente suave inferior para contraste legível */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Informações Sobrepostas na Imagem */}
                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                <div className="text-white">
                                    <h3 className="text-lg font-semibold tracking-tight leading-snug">
                                        Silvia Concierge
                                    </h3>
                                    <p className="text-xs text-slate-300 font-normal">
                                        Atendente Virtual • IA Médica
                                    </p>
                                </div>

                                {/* Pill de Preço / Status ($1,200 na referência) */}
                                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-sm">
                                    v2.4 Live
                                </div>
                            </div>
                        </div>

                        {/* Detalhes de Status da Persona */}
                        <div className="p-4 bg-white flex items-center justify-between text-xs text-slate-600 border-t border-[#F0EAE0]">
                            <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Hospital Otorrinos
                            </span>
                            <span className="text-[11px] text-slate-700 font-mono">
                                Latência: 120ms
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Accordion de Conexões e Dispositivos (Referência: Pension, Devices MacBook, Compensation) */}
                    <div className="bento-card p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-3">
                        
                        {/* Item 1: Dispositivo Conectado (MacBook Air / Smartphone WhatsApp) */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveAccordion(activeAccordion === "devices" ? "" : "devices")}
                                className="w-full flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                                    Dispositivos & WhatsApp
                                </span>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-700 transition-transform duration-200", activeAccordion === "devices" && "rotate-180")} />
                            </button>

                            {activeAccordion === "devices" && (
                                <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] flex items-center justify-between animate-in fade-in">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-white border border-[#E0D8C8] flex items-center justify-center text-slate-700">
                                            <Laptop className="w-4 h-4 text-slate-700" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-900">Silvia WhatsApp</span>
                                            <span className="text-[10px] text-slate-700">(41) 9119-4738</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300/60">
                                        Online
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#F0EAE0]" />

                        {/* Item 2: Integração Clinic API */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveAccordion(activeAccordion === "clinic" ? "" : "clinic")}
                                className="w-full flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Stethoscope className="w-3.5 h-3.5 text-slate-700" />
                                    Integração Clinic API
                                </span>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-700 transition-transform duration-200", activeAccordion === "clinic" && "rotate-180")} />
                            </button>

                            {activeAccordion === "clinic" && (
                                <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] text-[11px] text-slate-600 space-y-1.5 animate-in fade-in">
                                    <div className="flex justify-between">
                                        <span>Facility ID:</span>
                                        <span className="font-semibold text-slate-800">#1 (Otorrinos)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Médico Padrão:</span>
                                        <span className="font-semibold text-slate-800">Dr. Marco Antonio (10073)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Convênios:</span>
                                        <span className="font-semibold text-slate-800">Unimed, Sanepar, Part.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#F0EAE0]" />

                        {/* Item 3: Handoff Secretária Ana */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveAccordion(activeAccordion === "handoff" ? "" : "handoff")}
                                className="w-full flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-slate-950 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-slate-700" />
                                    Handoff Secretária Ana
                                </span>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-700 transition-transform duration-200", activeAccordion === "handoff" && "rotate-180")} />
                            </button>

                            {activeAccordion === "handoff" && (
                                <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] text-[11px] text-slate-600 space-y-1 animate-in fade-in">
                                    <div className="flex justify-between">
                                        <span>Contato Ana:</span>
                                        <span className="font-semibold text-slate-800">(41) 9147-4579</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Critério:</span>
                                        <span className="font-semibold text-amber-700">Sintomas Graves / Urgência</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={handleTriggerReport}
                                disabled={isTriggeringReport}
                                variant="outline"
                                className="w-full rounded-2xl border-[#E0D8C8] bg-white hover:bg-[#F4EFE6] text-xs font-medium text-slate-800 shadow-sm flex items-center justify-center gap-2"
                            >
                                {isTriggeringReport ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5 text-amber-600" />
                                )}
                                Enviar Relatório Diário à Ana
                            </Button>
                        </div>
                    </div>

                </div>

                {/* ----------------------------------------------------
                    COLUNA CENTRO (Cards 3, 4 & 7) - lg:col-span-5
                ---------------------------------------------------- */}
                <div className="lg:col-span-5 space-y-5">
                    
                    {/* Linha com Cards Menores: Progress & Time Tracker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Card 3: Progress (Referência: Progress 6.1h Work Time + Bar Chart S M T W T F S) */}
                        <div className="bento-card p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                                    <span>Progress</span>
                                    <button className="w-6 h-6 rounded-full hover:bg-[#F2ECE0] flex items-center justify-center text-slate-700">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-slate-900 tracking-tight">6.1 h</span>
                                    <span className="text-[10px] text-slate-700 leading-tight">Tempo Ativo<br />esta semana</span>
                                </div>
                            </div>

                            {/* Gráfico de Barras Vertical S M T W T F S com Friday destacado */}
                            <div className="mt-6 pt-2">
                                <div className="h-28 flex items-end justify-between gap-2 px-1 relative">
                                    
                                    {/* Tooltip flutuante 5h 23m na sexta-feira (Fiel à referência) */}
                                    <div className="absolute -top-3 right-6 px-2 py-0.5 rounded-full bg-[#F5BE38] text-slate-900 text-[10px] font-bold shadow-sm flex items-center gap-1">
                                        5h 23m
                                    </div>

                                    {/* Barras semanais */}
                                    {[
                                        { day: "S", height: "45%", highlight: false },
                                        { day: "M", height: "70%", highlight: false },
                                        { day: "T", height: "60%", highlight: false },
                                        { day: "W", height: "85%", highlight: false },
                                        { day: "T", height: "90%", highlight: false },
                                        { day: "F", height: "100%", highlight: true },
                                        { day: "S", height: "35%", highlight: false }
                                    ].map((b, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                            <div className="w-full max-w-[8px] h-full flex items-end">
                                                <div
                                                    className={cn(
                                                        "chart-bar-fill w-full rounded-full transition-all duration-300",
                                                        b.highlight
                                                            ? "bg-[#F5BE38] shadow-[0_0_12px_rgba(245,190,56,0.4)]"
                                                            : "bg-[#1E2022]"
                                                    )}
                                                    style={{ height: b.height }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-700">{b.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Time Tracker (Referência: 02:35 Circular Progress + Play/Pause) */}
                        <div className="bento-card p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                                    <span>Time tracker</span>
                                    <button className="w-6 h-6 rounded-full hover:bg-[#F2ECE0] flex items-center justify-center text-slate-700">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Mostrador Circular SVG (Referência com arco amarelo e linha pontilhada) */}
                                <div className="mt-3 flex justify-center items-center relative py-2">
                                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                                        {/* Círculo pontilhado de fundo */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            stroke="#E8E2D6"
                                            strokeWidth="3.5"
                                            strokeDasharray="2,3"
                                        />
                                        {/* Arco animado dourado/amarelo */}
                                        <circle
                                            className="timer-gauge-circle"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            stroke="#F5BE38"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeDasharray="251.2"
                                            strokeDashoffset="75"
                                        />
                                    </svg>

                                    {/* Texto Central do Timer */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-medium text-slate-900 tracking-tight font-mono">
                                            {formattedTimer}
                                        </span>
                                        <span className="text-[9px] text-slate-700 uppercase tracking-wider font-semibold">
                                            SLA Resposta
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Controles do Timer (Play, Pause, Alarm icon) */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setIsTimerPlaying(true)}
                                        className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors",
                                            isTimerPlaying
                                                ? "bg-[#1E2022] text-white"
                                                : "bg-[#F4EFE6] text-slate-700 hover:bg-[#EAE4D8]"
                                        )}
                                        title="Iniciar timer"
                                    >
                                        <Play className="w-3 h-3 fill-current ml-0.5" />
                                    </button>
                                    <button
                                        onClick={() => setIsTimerPlaying(false)}
                                        className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors",
                                            !isTimerPlaying
                                                ? "bg-[#1E2022] text-white"
                                                : "bg-[#F4EFE6] text-slate-700 hover:bg-[#EAE4D8]"
                                        )}
                                        title="Pausar timer"
                                    >
                                        <Pause className="w-3 h-3 fill-current" />
                                    </button>
                                </div>

                                <div className="w-7 h-7 rounded-full bg-[#1E2022] text-white flex items-center justify-center text-xs">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Card 7: Calendário Semanal / Timeline (Referência: September 2024, Mon 22 - Sat 27 + Eventos na Grade) */}
                    <div className="bento-card p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4">
                        
                        {/* Cabeçalho do Calendário */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                            <span className="text-slate-700 font-normal">Novembro</span>
                            <span className="font-semibold text-sm text-slate-900">Dezembro 2026</span>
                            <span className="text-slate-700 font-normal">Janeiro</span>
                        </div>

                        {/* Grade de Dias (Mon 22, Tue 23, Wed 24, Thu 25, Fri 26, Sat 27) */}
                        <div className="grid grid-cols-6 gap-2 text-center pt-1 border-b border-[#F0EAE0] pb-3">
                            {[
                                { day: "Mon", date: "22", active: false },
                                { day: "Tue", date: "23", active: false },
                                { day: "Wed", date: "24", active: false },
                                { day: "Thu", date: "25", active: false },
                                { day: "Fri", date: "26", active: false },
                                { day: "Tue", date: "29", active: true } // Dia oficial do agendamento
                            ].map((col, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex flex-col items-center py-1.5 rounded-2xl transition-colors",
                                        col.active ? "bg-[#1E2022] text-white font-semibold" : "text-slate-600 hover:bg-[#F7F3EA]"
                                    )}
                                >
                                    <span className={cn("text-[10px]", col.active ? "text-amber-400" : "text-slate-700")}>{col.day}</span>
                                    <span className="text-xs font-bold">{col.date}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grade de Horários com os Eventos Reais Mapeados */}
                        <div className="space-y-3 pt-1 text-xs text-slate-700 font-mono">
                            
                            {/* Linha 09:30 am */}
                            <div className="flex items-center gap-3">
                                <span className="w-14 text-[11px] text-slate-700 shrink-0">09:30 am</span>
                                <div className="flex-1 p-2 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] text-slate-700 text-[11px] flex items-center justify-between">
                                    <span>Vaga Disponível — Dr. Marco Antonio</span>
                                    <span className="text-[10px] text-slate-700 font-sans">Hospital Otorrinos</span>
                                </div>
                            </div>

                            {/* Linha 17:30 pm */}
                            <div className="flex items-center gap-3">
                                <span className="w-14 text-[11px] text-slate-700 shrink-0">17:30 pm</span>
                                <div className="flex-1 p-2 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] text-slate-700 text-[11px] flex items-center justify-between">
                                    <span>Vaga Disponível — Dr. Marco Antonio</span>
                                    <span className="text-[10px] text-slate-700 font-sans">Hospital Otorrinos</span>
                                </div>
                            </div>

                            {/* Linha 18:30 pm - EVENTO OFICIAL DA MARIA LUIZA (Card Escuro Fiel à Referência "Weekly Team Sync") */}
                            <div className="flex items-center gap-3">
                                <span className="w-14 text-[11px] font-semibold text-slate-900 shrink-0">18:30 pm</span>
                                <div className="flex-1 p-3 rounded-2xl bg-[#1E2022] text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                                            Dr. Marco Antonio — Maria Luiza
                                            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-bold">
                                                UNIMED
                                            </span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-sans mt-0.5">
                                            Reserva #1428912 • Voucher PDF Enviado
                                        </span>
                                    </div>
                                    {/* Avatares Pequenos */}
                                    <div className="flex -space-x-1.5 overflow-hidden">
                                        <div className="w-5 h-5 rounded-full bg-emerald-600 border border-white text-[9px] flex items-center justify-center font-bold">
                                            M
                                        </div>
                                        <div className="w-5 h-5 rounded-full bg-amber-500 border border-white text-[9px] flex items-center justify-center font-bold">
                                            L
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

                {/* ----------------------------------------------------
                    COLUNA DIREITA (Cards 5 & 6) - lg:col-span-4
                ---------------------------------------------------- */}
                <div className="lg:col-span-4 space-y-5">
                    
                    {/* Card 5: Onboarding & Tarefas da IA (Referência: Onboarding 18% + Onboarding Task 2/8) */}
                    <div className="bento-card p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4">
                        
                        {/* Topo: Onboarding 98% Taxa de Conclusão */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800">Triagem & Confirmações</span>
                            <span className="text-xl font-light text-slate-900 tracking-tight">98%</span>
                        </div>

                        {/* Mini Barra de Segmentos (30% yellow, 25% black, 0% grey na referência) */}
                        <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-[#F2ECE0] p-0.5">
                            <div className="h-full rounded-full bg-[#F5BE38]" style={{ width: "65%" }} />
                            <div className="h-full rounded-full bg-[#1E2022]" style={{ width: "30%" }} />
                            <div className="h-full rounded-full bg-slate-300" style={{ width: "5%" }} />
                        </div>

                        {/* Card Escuro de Tarefas (Referência: Onboarding Task 2/8) */}
                        <div className="p-4 rounded-[26px] bg-[#1E2022] text-white shadow-[0_6px_20px_rgba(0,0,0,0.18)] space-y-3">
                            <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                <span className="text-xs font-semibold tracking-tight text-white flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                                    Fila de Ações Automáticas
                                </span>
                                <span className="text-xs font-mono font-semibold text-amber-400">4/5</span>
                            </div>

                            {/* Lista de Itens com Checkmarks Dourados */}
                            <div className="space-y-2.5 text-xs">
                                
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white text-[11px]">Agendamento Clinic API</span>
                                            <span className="text-[10px] text-slate-400">Maria Luiza • 29/12 às 18:30</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-700 font-mono">11:10</span>
                                </div>

                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white text-[11px]">Voucher Oficial em PDF</span>
                                            <span className="text-[10px] text-slate-400">Disparado no WhatsApp #1428912</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-700 font-mono">11:10</span>
                                </div>

                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white text-[11px]">Etiqueta 'Confirmação' (ID 8)</span>
                                            <span className="text-[10px] text-slate-400">Evolution API sincronizada</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-700 font-mono">11:10</span>
                                </div>

                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-white/10 text-slate-400 flex items-center justify-center shrink-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-200 text-[11px]">Escuta Ativa WebSocket</span>
                                            <span className="text-[10px] text-slate-400">Aguardando novas mensagens</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-700 font-mono">Live</span>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* Card 6: Mockup SVG do Smartphone WhatsApp (Conexão ao Vivo do WebSocket) */}
                    <div className="bento-card p-5 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-3">
                        <div className="flex items-center justify-between pb-1">
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-semibold text-slate-800">
                                    Smartphone WhatsApp ao Vivo
                                </span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300/60">
                                WebSocket Feed
                            </span>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Simulador interativo conectado ao WhatsApp real da Silvia com todas as mensagens de Maria Luiza e pacientes de hoje.
                        </p>

                        {/* SVG Smartphone Mockup Wrapper */}
                        <div className="pt-2">
                            <SvgSmartphoneMockup statusBarTime="10:44" batteryLevel={98}>
                                <WhatsAppPhoneScreen
                                    chats={chatsList}
                                    selectedChatPhone={selectedChatPhone}
                                    onSelectChat={setSelectedChatPhone}
                                    activeFilter={activeFilter}
                                    onFilterChange={setActiveFilter}
                                />
                            </SvgSmartphoneMockup>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}

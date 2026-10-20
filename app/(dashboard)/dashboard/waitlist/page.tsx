"use client";

import { useState, useEffect, useMemo } from "react";
import {
    fetchWaitlistAction,
    createWaitlistEntryAction,
    updateWaitlistPriorityAction,
    updateWaitlistStatusAction,
    deleteWaitlistEntryAction,
    notifyWaitlistOfferAction,
} from "@/actions/waitlist.actions";
import { runMorningConfirmationDispatchAction } from "@/actions/confirmation.actions";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Clock,
    UserPlus,
    Flame,
    Star,
    CheckCircle2,
    XCircle,
    Trash2,
    CalendarDays,
    Phone,
    User,
    Stethoscope,
    Search,
    AlertCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    Send,
    MapPin,
    Sparkles,
    Calendar,
    ChevronRight,
    ChevronLeft,
    RefreshCw,
    MessageSquare,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 320, damping: 25 },
    },
};

interface WaitlistItem {
    id: string;
    ranking: number;
    patientName: string;
    phone: string;
    nin?: string | null;
    birthDate?: string | null;
    doctorId?: string | null;
    doctorName?: string | null;
    addressId?: string | null;
    currentBookingId?: string | null;
    currentBookingDate?: string | null;
    requestedBeforeDate?: string | null;
    preferredPeriod?: string | null;
    preferredDays?: string | null;
    priority: number;
    priorityReason?: string | null;
    status: string;
    offeredSlot?: string | null;
    offeredAt?: string | null;
    notes?: string | null;
    createdAt: string;
}

const priorityConfig: Record<number, { label: string; color: string; bg: string; border: string; icon: any }> = {
    3: { label: "Urgente", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: Flame },
    2: { label: "Alta", color: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200", icon: Star },
    1: { label: "Normal", color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200", icon: Clock },
};

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "Não definida";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return String(dateStr);
    }
}

export default function WaitlistPage() {
    const [entries, setEntries] = useState<WaitlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<number>(0);
    const [statusFilter, setStatusFilter] = useState<string>("AGUARDANDO");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Modal de Novo Paciente na Fila
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        patientName: "",
        phone: "",
        nin: "",
        doctorName: "",
        currentBookingDate: "",
        requestedBeforeDate: "",
        preferredPeriod: "QUALQUER",
        priority: 1,
        priorityReason: "",
        notes: "",
    });

    // Modal / Ação de Disparo das 08h
    const [dispatchingMorning, setDispatchingMorning] = useState(false);
    const [dispatchResult, setDispatchResult] = useState<string | null>(null);

    useEffect(() => {
        loadWaitlist();
    }, [priorityFilter, statusFilter]);

    const loadWaitlist = async () => {
        setLoading(true);
        const res = await fetchWaitlistAction({
            priority: priorityFilter,
            status: statusFilter,
        });
        if (res.success && res.data) {
            setEntries(res.data as WaitlistItem[]);
        }
        setLoading(false);
    };

    const handlePriorityChange = async (id: string, newPriority: number) => {
        setActionLoadingId(id);
        const res = await updateWaitlistPriorityAction(id, newPriority);
        if (res.success) {
            await loadWaitlist();
        } else {
            alert("Erro ao alterar prioridade.");
        }
        setActionLoadingId(null);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setActionLoadingId(id);
        const res = await updateWaitlistStatusAction(id, newStatus);
        if (res.success) {
            setEntries((prev) =>
                statusFilter === "ALL"
                    ? prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
                    : prev.filter((e) => e.id !== id)
            );
        } else {
            alert("Erro ao atualizar status.");
        }
        setActionLoadingId(null);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Remover "${name}" da lista de espera?`)) return;
        setActionLoadingId(id);
        const res = await deleteWaitlistEntryAction(id);
        if (res.success) {
            setEntries((prev) => prev.filter((e) => e.id !== id));
        } else {
            alert("Erro ao excluir registro.");
        }
        setActionLoadingId(null);
    };

    const handleNotifyOffer = async (entry: WaitlistItem) => {
        const slotInput = prompt(
            `Informe a data e hora do horário disponível para ${entry.patientName} (Formato: YYYY-MM-DDTHH:MM):`,
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        );
        if (!slotInput) return;

        setActionLoadingId(entry.id);
        const res = await notifyWaitlistOfferAction(entry.id, slotInput);
        if (res.success) {
            alert(`Mensagem com a vaga antecipada enviada com sucesso para ${entry.patientName}!`);
            await loadWaitlist();
        } else {
            alert(res.error || "Erro ao enviar notificação.");
        }
        setActionLoadingId(null);
    };

    const handleCreateEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await createWaitlistEntryAction({
            patientName: formData.patientName,
            phone: formData.phone,
            nin: formData.nin || undefined,
            doctorName: formData.doctorName || undefined,
            currentBookingDate: formData.currentBookingDate || undefined,
            requestedBeforeDate: formData.requestedBeforeDate || undefined,
            preferredPeriod: formData.preferredPeriod,
            priority: Number(formData.priority),
            priorityReason: formData.priorityReason || undefined,
            notes: formData.notes || undefined,
        });

        if (res.success) {
            setIsAddModalOpen(false);
            setFormData({
                patientName: "",
                phone: "",
                nin: "",
                doctorName: "",
                currentBookingDate: "",
                requestedBeforeDate: "",
                preferredPeriod: "QUALQUER",
                priority: 1,
                priorityReason: "",
                notes: "",
            });
            await loadWaitlist();
        } else {
            alert(res.error || "Erro ao salvar na fila de espera.");
        }
        setSubmitting(false);
    };

    const handleTriggerMorningConfirmations = async () => {
        if (!window.confirm("Executar agora o disparo de confirmações das 08h (consultas de 48h e 24h à frente)?")) return;
        setDispatchingMorning(true);
        setDispatchResult(null);
        const res = await runMorningConfirmationDispatchAction();
        if (res.success && res.data) {
            setDispatchResult(
                `Disparo concluído! ${res.data.sent48h + res.data.sent24h} mensagens enviadas (${res.data.sent48h} de 48h, ${res.data.sent24h} de 24h). ${res.data.alreadySent} já haviam sido enviadas.`
            );
        } else {
            setDispatchResult(res.error || "Erro ao executar disparos.");
        }
        setDispatchingMorning(false);
    };

    const filteredEntries = entries.filter((e) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            e.patientName.toLowerCase().includes(term) ||
            e.phone.includes(term) ||
            (e.nin && e.nin.includes(term)) ||
            (e.doctorName && e.doctorName.toLowerCase().includes(term))
        );
    });

    // ═══ PAGINAÇÃO ═══
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Reinicia para a página 1 ao alterar filtros, busca ou itens por página
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, priorityFilter, statusFilter, itemsPerPage]);

    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;

    // Garante que a página atual não fique fora do limite se os itens diminuírem
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedEntries = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredEntries.slice(start, start + itemsPerPage);
    }, [filteredEntries, currentPage, itemsPerPage]);

    const urgentCount = entries.filter((e) => e.priority === 3).length;
    const highCount = entries.filter((e) => e.priority === 2).length;
    const waitingCount = entries.filter((e) => e.status === "AGUARDANDO").length;
    const offeredCount = entries.filter((e) => e.status === "OFERTADO").length;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full space-y-8 pb-16 text-slate-800"
        >
            {/* ═══ HEADER ═══ */}
            <motion.div variants={item} className="flex flex-col gap-4 pb-2 border-b border-[#E8E2D6]/70">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
                                Hospital Otorrinos Curitiba
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300/80">
                                Rankeamento Inteligente
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
                            Lista de <span className="font-semibold text-slate-900">Espera & Desistências</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-700 mt-1">
                            Monitoramento prioritário de pacientes aguardando antecipação de consultas por desistência ou cancelamento.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="rounded-2xl bg-[#1E2022] hover:bg-slate-800 text-white gap-2 text-xs font-semibold shadow-sm transition-all"
                        >
                            <UserPlus className="w-4 h-4 text-amber-400" />
                            Adicionar à Fila
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleTriggerMorningConfirmations}
                            disabled={dispatchingMorning}
                            className="rounded-2xl bg-white border-[#E8E2D6] hover:bg-[#F2ECE0] text-slate-800 gap-2 text-xs font-semibold shadow-xs transition-all"
                            title="Executar disparo de confirmação das 08h manualmente"
                        >
                            {dispatchingMorning ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            ) : (
                                <Send className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            Disparo 08h (48h/24h)
                        </Button>
                    </div>
                </div>

                {dispatchResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between"
                    >
                        <span>{dispatchResult}</span>
                        <button onClick={() => setDispatchResult(null)} className="text-blue-700 font-bold hover:underline">
                            Fechar
                        </button>
                    </motion.div>
                )}

                {/* ═══ BENTO METRICS ═══ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                    <div className="bg-white border border-[#E8E2D6] rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-slate-600">
                            <span className="text-xs font-medium">Aguardando na Fila</span>
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{waitingCount}</p>
                        <span className="text-[10px] text-slate-700">Por ordem de prioridade</span>
                    </div>

                    <div className="bg-white border border-[#E8E2D6] rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-rose-700">
                            <span className="text-xs font-semibold">Prioridade Urgente</span>
                            <Flame className="w-4 h-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-bold text-rose-700 mt-2">{urgentCount}</p>
                        <span className="text-[10px] text-rose-600 font-medium">Topo do ranking (#1)</span>
                    </div>

                    <div className="bg-white border border-[#E8E2D6] rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-amber-800">
                            <span className="text-xs font-semibold">Prioridade Alta</span>
                            <Star className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-amber-800 mt-2">{highCount}</p>
                        <span className="text-[10px] text-amber-700">Preferência qualificada</span>
                    </div>

                    <div className="bg-white border border-[#E8E2D6] rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-emerald-800">
                            <span className="text-xs font-medium">Vagas Ofertadas</span>
                            <Send className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 mt-2">{offeredCount}</p>
                        <span className="text-[10px] text-emerald-700">Aguardando aceite do paciente</span>
                    </div>
                </div>

                {/* ═══ CONTROLS (SEARCH & FILTERS) ═══ */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
                    <div className="relative w-full lg:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar paciente, telefone ou médico..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E2D6] rounded-2xl text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-xs transition-all"
                        />
                    </div>

                    {/* Filtros de Prioridade e Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border border-[#E8E2D6] shadow-xs rounded-full p-1 overflow-x-auto shrink-0">
                            {[
                                { id: 0, label: "Todas" },
                                { id: 3, label: "Urgente", icon: Flame, color: "text-rose-600" },
                                { id: 2, label: "Alta", icon: Star, color: "text-amber-600" },
                                { id: 1, label: "Normal", icon: Clock, color: "text-slate-600" },
                            ].map((p) => {
                                const isActive = priorityFilter === p.id;
                                const Icon = p.icon;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setPriorityFilter(p.id)}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                                            isActive
                                                ? "bg-[#1E2022] text-white shadow-xs font-semibold"
                                                : "text-slate-700 hover:text-slate-900 hover:bg-[#F2ECE0]"
                                        )}
                                    >
                                        {Icon && <Icon className={cn("w-3 h-3", isActive ? "text-amber-400" : p.color)} />}
                                        <span>{p.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-[#E8E2D6] rounded-2xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none shadow-xs cursor-pointer"
                        >
                            <option value="AGUARDANDO">Status: Aguardando</option>
                            <option value="OFERTADO">Status: Ofertado</option>
                            <option value="AGENDADO">Status: Concluído / Agendado</option>
                            <option value="ALL">Status: Todos</option>
                        </select>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={loadWaitlist}
                            className="rounded-xl hover:bg-[#F2ECE0] text-slate-700"
                            title="Atualizar lista"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* ═══ LOADING ═══ */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                    <span className="ml-3 text-slate-600 text-xs font-medium">Carregando lista de espera...</span>
                </div>
            )}

            {/* ═══ EMPTY STATE ═══ */}
            {!loading && filteredEntries.length === 0 && (
                <div className="bg-white border border-[#E8E2D6] rounded-[32px] p-12 text-center shadow-xs flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-amber-700 mb-3">
                        <Clock className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-base text-slate-900">Nenhum paciente na fila de espera</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-md">
                        {searchTerm
                            ? "Nenhum resultado para os termos buscados."
                            : "Não há pacientes aguardando no momento com os filtros selecionados."}
                    </p>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 rounded-xl bg-[#1E2022] text-white text-xs gap-1.5"
                    >
                        <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                        Adicionar Paciente
                    </Button>
                </div>
            )}

            {/* ═══ RANKED CARDS LIST ═══ */}
            {!loading && filteredEntries.length > 0 && (
                <div className="space-y-4">
                    {paginatedEntries.map((entry) => {
                        const priorityInfo = priorityConfig[entry.priority] || priorityConfig[1];
                        const PriorityIcon = priorityInfo.icon;
                        const isActionLoading = actionLoadingId === entry.id;

                        // Medalha do ranking (#1, #2, #3 com visual nobre)
                        const isTop1 = entry.ranking === 1;
                        const isTop2 = entry.ranking === 2;
                        const isTop3 = entry.ranking === 3;

                        return (
                            <motion.div
                                key={entry.id}
                                variants={item}
                                className={cn(
                                    "bg-white border rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all relative overflow-hidden group hover:border-amber-300",
                                    isTop1 ? "border-amber-400/80 bg-gradient-to-r from-amber-50/20 via-white to-white" : "border-[#E8E2D6]"
                                )}
                            >
                                {/* Bloco Esquerdo: Ranking + Paciente + Detalhes */}
                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                    {/* Ranking Ordinal Badge */}
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 border shadow-xs select-none",
                                            isTop1
                                                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
                                                : isTop2
                                                ? "bg-slate-200 text-slate-800 border-slate-300"
                                                : isTop3
                                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                                : "bg-[#F8F5EE] text-slate-700 border-[#E8E2D6]"
                                        )}
                                        title={`Posição #${entry.ranking} na fila de prioridade`}
                                    >
                                        <span className="text-[10px] uppercase font-semibold leading-none">Rank</span>
                                        <span className="text-base font-extrabold leading-none mt-0.5">#{entry.ranking}</span>
                                    </div>

                                    {/* Informações Principais */}
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                                {entry.patientName}
                                            </h3>

                                            {/* Badge de Prioridade */}
                                            <div
                                                className={cn(
                                                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                    priorityInfo.bg,
                                                    priorityInfo.color,
                                                    priorityInfo.border
                                                )}
                                            >
                                                <PriorityIcon className="w-3 h-3" />
                                                <span>{priorityInfo.label}</span>
                                            </div>

                                            {/* Status Badge */}
                                            <span
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                    entry.status === "AGUARDANDO"
                                                        ? "bg-blue-50 text-blue-800 border-blue-200"
                                                        : entry.status === "OFERTADO"
                                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                )}
                                            >
                                                {entry.status}
                                            </span>
                                        </div>

                                        {/* Metadados: Médico, Agendamento Atual vs Limite */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-700">
                                            <div className="flex items-center gap-1.5">
                                                <Stethoscope className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <span className="truncate">
                                                    Médico: <strong>{entry.doctorName || "Qualquer Especialista"}</strong>
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <a
                                                    href={`https://wa.me/55${entry.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-blue-700 hover:underline flex items-center gap-1"
                                                >
                                                    {entry.phone}
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <span>
                                                    Turno: <strong>{entry.preferredPeriod || "Qualquer"}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Regra de Data: Consulta Atual vs Data Desejada */}
                                        <div className="p-2.5 rounded-xl bg-[#FBF9F4] border border-[#E8E2D6] text-xs flex flex-wrap items-center gap-4">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-slate-600 block">Consulta Atual</span>
                                                <span className="font-medium text-slate-900">
                                                    {entry.currentBookingDate ? formatDate(entry.currentBookingDate) : "Ainda sem consulta"}
                                                </span>
                                            </div>

                                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />

                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-amber-800 block">Aceita antecipação até</span>
                                                <span className="font-semibold text-amber-900">
                                                    {entry.requestedBeforeDate ? formatDate(entry.requestedBeforeDate) : "O quanto antes"}
                                                </span>
                                            </div>

                                            {entry.priorityReason && (
                                                <div className="sm:border-l sm:border-[#E8E2D6] sm:pl-4">
                                                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Motivo Prioridade</span>
                                                    <span className="text-slate-800 font-medium">{entry.priorityReason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bloco Direito: Ações Rápidas */}
                                <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F0EAE0]">
                                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                        {/* Ofertar Vaga Antecipada via WhatsApp */}
                                        <Button
                                            size="sm"
                                            onClick={() => handleNotifyOffer(entry)}
                                            disabled={isActionLoading}
                                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold shadow-xs transition-all flex-1 sm:flex-auto"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            Ofertar Vaga
                                        </Button>

                                        {/* Alternar Prioridade Rapidamente */}
                                        <div className="flex items-center gap-0.5 border border-[#E8E2D6] rounded-xl p-0.5 bg-white">
                                            <button
                                                onClick={() => handlePriorityChange(entry.id, 3)}
                                                disabled={isActionLoading || entry.priority === 3}
                                                className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                                                    entry.priority === 3 ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                                                )}
                                                title="Tornar Urgente"
                                            >
                                                Urg
                                            </button>
                                            <button
                                                onClick={() => handlePriorityChange(entry.id, 2)}
                                                disabled={isActionLoading || entry.priority === 2}
                                                className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                                                    entry.priority === 2 ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                                                )}
                                                title="Tornar Alta"
                                            >
                                                Alta
                                            </button>
                                            <button
                                                onClick={() => handlePriorityChange(entry.id, 1)}
                                                disabled={isActionLoading || entry.priority === 1}
                                                className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                                                    entry.priority === 1 ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-100"
                                                )}
                                                title="Tornar Normal"
                                            >
                                                Norm
                                            </button>
                                        </div>

                                        {/* Concluir / Agendado */}
                                        {entry.status !== "AGENDADO" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusChange(entry.id, "AGENDADO")}
                                                disabled={isActionLoading}
                                                className="rounded-xl bg-white border-[#E8E2D6] text-emerald-700 hover:bg-emerald-50 text-xs px-2.5"
                                                title="Marcar como Agendado/Concluído"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}

                                        {/* Excluir da Fila */}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(entry.id, entry.patientName)}
                                            disabled={isActionLoading}
                                            className="rounded-xl bg-white border-[#E8E2D6] text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs px-2"
                                            title="Remover da lista de espera"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Controles de Paginação */}
                    <div className="bg-white border border-[#E8E2D6] rounded-[24px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 mt-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <div>
                                Mostrando <b className="text-slate-900 font-bold">{(currentPage - 1) * itemsPerPage + 1}</b> a{" "}
                                <b className="text-slate-900 font-bold">{Math.min(currentPage * itemsPerPage, filteredEntries.length)}</b> de{" "}
                                <b className="text-slate-900 font-bold">{filteredEntries.length}</b> pacientes na fila
                            </div>

                            <div className="h-4 w-px bg-[#E8E2D6] hidden sm:block" />

                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-500">Exibir:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="bg-[#F8F5EE] border border-[#E8E2D6] rounded-xl px-2.5 py-1 text-slate-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                                >
                                    <option value={5}>5 por pág</option>
                                    <option value={10}>10 por pág</option>
                                    <option value={20}>20 por pág</option>
                                    <option value={50}>50 por pág</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-[#E8E2D6] bg-white text-slate-700 hover:bg-[#F3EFE6] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs flex items-center justify-center cursor-pointer"
                                title="Página anterior"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Botões numéricos de página */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => {
                                    if (totalPages <= 7) return true;
                                    if (p === 1 || p === totalPages) return true;
                                    if (Math.abs(p - currentPage) <= 1) return true;
                                    return false;
                                })
                                .map((pageNum, idx, arr) => {
                                    const prev = arr[idx - 1];
                                    const showEllipsis = prev && pageNum - prev > 1;

                                    return (
                                        <div key={pageNum} className="flex items-center gap-1">
                                            {showEllipsis && <span className="px-1 text-slate-400 select-none">...</span>}
                                            <button
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={cn(
                                                    "min-w-8 h-8 px-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
                                                    currentPage === pageNum
                                                        ? "bg-[#1E2022] text-white border-[#1E2022] shadow-xs font-bold"
                                                        : "bg-white text-slate-700 border-[#E8E2D6] hover:bg-[#F3EFE6]"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        </div>
                                    );
                                })}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-[#E8E2D6] bg-white text-slate-700 hover:bg-[#F3EFE6] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs flex items-center justify-center cursor-pointer"
                                title="Próxima página"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL: ADICIONAR PACIENTE À FILA ═══ */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white border border-[#E8E2D6] rounded-[32px] p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Novo Paciente na Lista de Espera</h3>
                                <p className="text-xs text-slate-600 mt-0.5">Cadastre o paciente e configure os critérios de antecipação.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateEntry} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Nome Completo do Paciente *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    placeholder="Ex: Maria dos Santos"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D6] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-800 block mb-1">WhatsApp / Telefone *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="41999998888"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D6] focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-800 block mb-1">CPF (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.nin}
                                        onChange={(e) => setFormData({ ...formData, nin: e.target.value })}
                                        placeholder="000.000.000-00"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D6] focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Médico Desejado</label>
                                <input
                                    type="text"
                                    value={formData.doctorName}
                                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                    placeholder="Ex: Dr. Henrique / Dra. Ana (ou deixe vazio para qualquer)"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D6] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-800 block mb-1">Data Agendada Atual</label>
                                    <input
                                        type="date"
                                        value={formData.currentBookingDate}
                                        onChange={(e) => setFormData({ ...formData, currentBookingDate: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D6] focus:outline-none"
                                    />
                                    <span className="text-[10px] text-slate-500">Horários vagos devem ser antes desta data</span>
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-800 block mb-1">Aceita até (Data Limite)</label>
                                    <input
                                        type="date"
                                        value={formData.requestedBeforeDate}
                                        onChange={(e) => setFormData({ ...formData, requestedBeforeDate: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D6] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-800 block mb-1">Turno Preferido</label>
                                    <select
                                        value={formData.preferredPeriod}
                                        onChange={(e) => setFormData({ ...formData, preferredPeriod: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D6] focus:outline-none bg-white"
                                    >
                                        <option value="QUALQUER">Qualquer horário</option>
                                        <option value="MANHA">Apenas Manhã (&lt; 12h)</option>
                                        <option value="TARDE">Apenas Tarde (≥ 12h)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-800 block mb-1">Rank de Prioridade *</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D6] focus:outline-none bg-white font-semibold"
                                    >
                                        <option value={1}>1 - Normal (Fila comum)</option>
                                        <option value={2}>2 - Alta (Idoso / Retorno / Queixa)</option>
                                        <option value={3}>3 - Urgente (Pós-operatório / Dor aguda)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Motivo da Prioridade</label>
                                <input
                                    type="text"
                                    value={formData.priorityReason}
                                    onChange={(e) => setFormData({ ...formData, priorityReason: e.target.value })}
                                    placeholder="Ex: Pós-cirúrgico, solicitou encaixe de urgência"
                                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D6] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-800 block mb-1">Observações Internas</label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Observações adicionais para a recepção..."
                                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D6] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EAE0]">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="rounded-xl border-[#E8E2D6]"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-[#1E2022] hover:bg-slate-800 text-white gap-2 font-semibold"
                                >
                                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5 text-amber-400" />}
                                    Salvar na Fila
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

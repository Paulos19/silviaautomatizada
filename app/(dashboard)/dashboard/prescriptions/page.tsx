"use client";

import { useState, useEffect } from "react";
import {
    fetchPrescriptionRequestsAction,
    updatePrescriptionStatusAction,
    deletePrescriptionRequestAction,
    togglePassarCarteirinhaAction,
} from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Pill,
    Download,
    CheckCircle2,
    XCircle,
    Trash2,
    Clock,
    User,
    CalendarDays,
    CreditCard,
    MapPin,
    FileText,
    Sparkles,
    AlertCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

interface PrescriptionRequest {
    id: string;
    patientName: string;
    birthDate: string;
    unimedCard: string;
    address: string;
    medications: string;
    status: string;
    passarCarteirinha?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
    PENDENTE: { label: "Pendente", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock },
    CONCLUIDO: { label: "Concluído", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
    REJEITADO: { label: "Rejeitado", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: XCircle },
};

function formatDate(dateStr: Date | string) {
    try {
        const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
        return d.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return String(dateStr);
    }
}

// ─── PDF Generation ───
function generatePrescriptionPDF(req: PrescriptionRequest) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Solicitação de Receita — ${req.patientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page { size: A4; margin: 0; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #1a1a2e;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 0;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 32mm 24mm 24mm 24mm;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    /* Header Band */
    .header-band {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 18mm;
      background: linear-gradient(135deg, #0d9488, #06b6d4, #8b5cf6);
    }
    
    .header-band::after {
      content: '';
      position: absolute;
      bottom: -8mm;
      left: 0;
      right: 0;
      height: 8mm;
      background: linear-gradient(180deg, rgba(13,148,136,0.08), transparent);
    }
    
    /* Title Area */
    .title-area {
      text-align: center;
      margin-bottom: 10mm;
      position: relative;
    }
    
    .title-area h1 {
      font-size: 22pt;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    
    .title-area .subtitle {
      font-size: 10pt;
      color: #64748b;
      margin-top: 2mm;
      font-weight: 400;
    }
    
    .title-area .date-badge {
      display: inline-block;
      margin-top: 4mm;
      padding: 2mm 5mm;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      font-size: 9pt;
      color: #15803d;
      font-weight: 500;
    }
    
    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5mm;
      margin-bottom: 10mm;
    }
    
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 5mm 6mm;
    }
    
    .info-card.full-width {
      grid-column: 1 / -1;
    }
    
    .info-card .label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 2mm;
    }
    
    .info-card .value {
      font-size: 11pt;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.4;
    }
    
    /* Medications Section */
    .meds-section {
      flex: 1;
      margin-bottom: 10mm;
    }
    
    .meds-section .meds-header {
      display: flex;
      align-items: center;
      gap: 3mm;
      margin-bottom: 5mm;
      padding-bottom: 3mm;
      border-bottom: 2px solid #0d9488;
    }
    
    .meds-section .meds-header h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #0f172a;
    }
    
    .meds-section .meds-header .pill-icon {
      width: 8mm;
      height: 8mm;
      background: linear-gradient(135deg, #0d9488, #06b6d4);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14pt;
    }
    
    .meds-content {
      background: #fafbfc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 6mm 7mm;
      font-size: 11pt;
      line-height: 1.8;
      color: #334155;
      white-space: pre-wrap;
      min-height: 60mm;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding-top: 6mm;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer p {
      font-size: 8pt;
      color: #94a3b8;
    }
    
    .footer .brand {
      font-weight: 600;
      color: #0d9488;
    }
    
    /* Status Badge */
    .status-badge {
      display: inline-block;
      padding: 1.5mm 4mm;
      border-radius: 20px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .status-PENDENTE { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .status-CONCLUIDO { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .status-REJEITADO { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    
    @media print {
      body { width: 210mm; min-height: 297mm; }
      .page { width: 210mm; min-height: 297mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header-band"></div>
    
    <div class="title-area">
      <h1>Solicitação de Receita</h1>
      <p class="subtitle">Hospital Otorrinos Curitiba — Renovação de Receituário</p>
      <span class="date-badge">Solicitado em ${formatDate(req.createdAt)}</span>
    </div>
    
    <div class="info-grid">
      <div class="info-card">
        <div class="label">Paciente</div>
        <div class="value">${req.patientName}</div>
      </div>
      <div class="info-card">
        <div class="label">Data de Nascimento</div>
        <div class="value">${req.birthDate}</div>
      </div>
      <div class="info-card">
        <div class="label">Carteirinha Unimed</div>
        <div class="value">${req.unimedCard || "Não informada"}${req.passarCarteirinha ? ' <span class="status-badge" style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 7.5pt; margin-left: 4px;">⚠️ Passar Carteirinha</span>' : ''}</div>
      </div>
      <div class="info-card">
        <div class="label">Status</div>
        <div class="value">
          <span class="status-badge status-${req.status}">
            ${req.status === "CONCLUIDO" ? "Concluído" : req.status === "REJEITADO" ? "Rejeitado" : "Pendente"}
          </span>
        </div>
      </div>
      <div class="info-card full-width">
        <div class="label">Endereço</div>
        <div class="value">${req.address}</div>
      </div>
    </div>
    
    <div class="meds-section">
      <div class="meds-header">
        <div class="pill-icon">💊</div>
        <h2>Medicamentos Solicitados</h2>
      </div>
      <div class="meds-content">${req.medications}</div>
    </div>
    
    <div class="footer">
      <p>Documento gerado automaticamente por <span class="brand">Silvia Automatizada</span> · ${new Date().toLocaleDateString("pt-BR")}</p>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
}

// ─── Main Page ───
export default function PrescriptionsPage() {
    const [requests, setRequests] = useState<PrescriptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingTagId, setTogglingTagId] = useState<string | null>(null);
    const [onlyPassarCarteirinha, setOnlyPassarCarteirinha] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "PENDENTE" | "CONCLUIDO" | "REJEITADO">("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        const res = await fetchPrescriptionRequestsAction();
        if (res.success && res.data) {
            setRequests(res.data as PrescriptionRequest[]);
        }
        setLoading(false);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        const res = await updatePrescriptionStatusAction(id, newStatus);
        if (res.success) {
            setRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
            );
        }
        setUpdatingId(null);
    };

    const handleToggleCarteirinha = async (id: string, currentVal: boolean) => {
        setTogglingTagId(id);
        const nextVal = !currentVal;

        // Optimistic UI update
        setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, passarCarteirinha: nextVal } : r))
        );

        const res = await togglePassarCarteirinhaAction(id, nextVal);
        if (!res.success) {
            // Reverte em caso de falha
            setRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, passarCarteirinha: currentVal } : r))
            );
            alert("Erro ao atualizar a tag 'Passar Carteirinha'.");
        }
        setTogglingTagId(null);
    };

    const handleDelete = async (id: string, patientName: string) => {
        const confirmed = window.confirm(
            `Tem certeza que deseja excluir permanentemente a solicitação de receita de "${patientName}"? Esta ação não pode ser desfeita.`
        );
        if (!confirmed) return;

        setDeletingId(id);
        const res = await deletePrescriptionRequestAction(id);
        if (res.success) {
            setRequests((prev) => prev.filter((r) => r.id !== id));
        } else {
            alert("Erro ao excluir solicitação de receita.");
        }
        setDeletingId(null);
    };

    // Reset pagination when search, filter or items per page change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter, onlyPassarCarteirinha, itemsPerPage]);

    const searchFilteredRequests = requests.filter((r) => {
        const matchesSearch = searchTerm === "" ||
            r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.unimedCard.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.medications && r.medications.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCarteirinha = !onlyPassarCarteirinha || Boolean(r.passarCarteirinha);

        return matchesSearch && matchesCarteirinha;
    });

    const filtered = filter === "ALL" ? searchFilteredRequests : searchFilteredRequests.filter((r) => r.status === filter);

    const counts = {
        ALL: searchFilteredRequests.length,
        PENDENTE: searchFilteredRequests.filter((r) => r.status === "PENDENTE").length,
        CONCLUIDO: searchFilteredRequests.filter((r) => r.status === "CONCLUIDO").length,
        REJEITADO: searchFilteredRequests.filter((r) => r.status === "REJEITADO").length,
    };

    const carteirinhaCount = requests.filter((r) => Boolean(r.passarCarteirinha)).length;

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
    const paginatedRequests = filtered.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (safePage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (safePage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full space-y-8 pb-16 text-slate-800"
        >
            {/* ═══ HEADER ═══ */}
            <motion.div variants={item} className="flex flex-col gap-4 pb-2 border-b border-[#E8E2D6]/70">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
                            Hospital Otorrinos Curitiba
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
                        Gestão de <span className="font-semibold text-slate-900">Receitas Médicas</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-700 mt-1">
                        Solicitações de renovação de receituário captadas pela Silvia Concierge via WhatsApp.
                    </p>
                </div>

                {/* ═══ CONTROLS (SEARCH & FILTERS) ═══ */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar paciente ou carteirinha..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E2D6] rounded-2xl text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-sm transition-all"
                            />
                        </div>

                        {/* Botão de Filtro "Passar Carteirinha" */}
                        <button
                            type="button"
                            onClick={() => setOnlyPassarCarteirinha((prev) => !prev)}
                            className={cn(
                                "px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 border shadow-sm cursor-pointer shrink-0",
                                onlyPassarCarteirinha
                                    ? "bg-amber-500 text-white border-amber-600 shadow-[0_4px_14px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/30"
                                    : "bg-white text-slate-700 hover:bg-[#F2ECE0] border-[#E8E2D6]"
                            )}
                            title={onlyPassarCarteirinha ? "Mostrando apenas 'Passar Carteirinha'. Clique para ver todas." : "Filtrar receitas com a tag 'Passar Carteirinha'"}
                        >
                            <CreditCard className={cn("w-3.5 h-3.5", onlyPassarCarteirinha ? "text-white" : "text-amber-700")} />
                            <span>Passar Carteirinha</span>
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
                                onlyPassarCarteirinha ? "bg-white text-amber-950" : "bg-amber-100 text-amber-900"
                            )}>
                                {carteirinhaCount}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center self-start lg:self-auto gap-1 bg-white border border-[#E8E2D6] shadow-sm rounded-full p-1 overflow-x-auto max-w-full shrink-0">
                        {(["ALL", "PENDENTE", "CONCLUIDO", "REJEITADO"] as const).map((f) => {
                            const labels: Record<string, string> = {
                                ALL: "Todas",
                                PENDENTE: "Pendentes",
                                CONCLUIDO: "Concluídas",
                                REJEITADO: "Rejeitadas",
                            };
                            const isActive = filter === f;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                                        isActive
                                            ? "bg-[#1E2022] text-white shadow-sm font-semibold"
                                            : "text-slate-700 hover:text-slate-900 hover:bg-[#F2ECE0]"
                                    )}
                                >
                                    <span>{labels[f]}</span>
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                                        isActive ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-700"
                                    )}>
                                        {counts[f]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* ═══ LOADING ═══ */}
            {loading && (
                <motion.div variants={item} className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                    <span className="ml-3 text-slate-600 text-xs">Carregando solicitações de receitas...</span>
                </motion.div>
            )}

            {/* ═══ EMPTY STATE ═══ */}
            {!loading && filtered.length === 0 && (
                <motion.div
                    variants={item}
                    className="bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 text-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-amber-700">
                        <Pill className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base text-slate-900">
                            Nenhuma solicitação encontrada
                        </h3>
                        <p className="text-xs text-slate-700 mt-1">
                            {filter === "ALL"
                                ? "Não há solicitações de renovação de receita registradas hoje."
                                : `Nenhuma solicitação com o status "${filter.toLowerCase()}".`}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ═══ CARDS ═══ */}
            {!loading && filtered.length > 0 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {paginatedRequests.map((req) => {
                            const status = statusConfig[req.status] || statusConfig.PENDENTE;
                            const StatusIcon = status.icon;
                            const isUpdating = updatingId === req.id;

                            return (
                                <motion.div
                                    key={req.id}
                                    variants={item}
                                    className="bg-white border border-[#E8E2D6] rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 md:p-7 flex flex-col justify-between group hover:border-amber-300 transition-all relative overflow-hidden"
                                >
                                    {/* Status + Date header */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EAE0]">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <div className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    req.status === "CONCLUIDO" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                                                    req.status === "REJEITADO" ? "bg-rose-50 text-rose-800 border border-rose-200" :
                                                    "bg-amber-50 text-amber-800 border border-amber-200"
                                                )}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status.label}
                                                </div>

                                                {/* Tag Passar Carteirinha (Badge Clicável no Header) */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleCarteirinha(req.id, Boolean(req.passarCarteirinha))}
                                                    disabled={togglingTagId === req.id}
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs",
                                                        req.passarCarteirinha
                                                            ? "bg-amber-500 hover:bg-amber-600 text-white border border-amber-600/30 ring-2 ring-amber-400/20"
                                                            : "bg-[#F8F5EE] hover:bg-amber-100/80 text-slate-600 hover:text-amber-900 border border-[#E8E2D6]"
                                                    )}
                                                    title={req.passarCarteirinha ? "Tag 'Passar Carteirinha' ATIVA. Clique para desativar." : "Clique para ativar a tag 'Passar Carteirinha'"}
                                                >
                                                    {togglingTagId === req.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin text-current" />
                                                    ) : (
                                                        <CreditCard className="w-3 h-3" />
                                                    )}
                                                    <span>Passar Carteirinha</span>
                                                    {req.passarCarteirinha && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1 text-[11px] text-slate-700 font-mono">
                                                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                                                {formatDate(req.createdAt)}
                                            </div>
                                        </div>

                                        {/* Patient Info */}
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-slate-800 font-bold shrink-0">
                                                    {req.patientName.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                                                        {req.patientName}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-700 mt-0.5">
                                                        Data Nasc.: {req.birthDate}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                {/* Carteirinha com Ação de Ativar Tag */}
                                                <div className={cn(
                                                    "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                                                    req.passarCarteirinha
                                                        ? "bg-amber-50/90 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.12)]"
                                                        : "bg-[#FBF9F4] border-[#E8E2D6]"
                                                )}>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <CreditCard className={cn(
                                                            "w-3.5 h-3.5 shrink-0",
                                                            req.passarCarteirinha ? "text-amber-600" : "text-amber-700"
                                                        )} />
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-[9px] text-slate-700 uppercase font-semibold">Carteirinha</p>
                                                                {req.passarCarteirinha && (
                                                                    <span className="text-[8px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                                                                        Ativa
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-mono font-medium text-slate-900 truncate">{req.unimedCard || "Não informada"}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleCarteirinha(req.id, Boolean(req.passarCarteirinha))}
                                                        disabled={togglingTagId === req.id}
                                                        className={cn(
                                                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ml-2 flex items-center gap-1 shadow-xs cursor-pointer",
                                                            req.passarCarteirinha
                                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                : "bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-[#E8E2D6]"
                                                        )}
                                                        title={req.passarCarteirinha ? "Tag ativa. Clique para desativar." : "Clique para ativar a tag 'Passar Carteirinha'"}
                                                    >
                                                        {togglingTagId === req.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <CreditCard className="w-3 h-3" />
                                                        )}
                                                        <span>{req.passarCarteirinha ? "Ativa" : "Ativar Tag"}</span>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FBF9F4] border border-[#E8E2D6]">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] text-slate-700 uppercase font-semibold">Endereço de Entrega</p>
                                                        <p className="text-xs font-medium text-slate-900 truncate">{req.address || "Retirada no Hospital"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Medications */}
                                            <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6]">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <Pill className="w-3.5 h-3.5 text-amber-700" />
                                                    <p className="text-[10px] text-slate-700 uppercase tracking-wider font-semibold">
                                                        Medicamentos & Dosagens Solicitadas
                                                    </p>
                                                </div>
                                                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                                                    {req.medications}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#F0EAE0]">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => generatePrescriptionPDF(req)}
                                            className="rounded-xl bg-white border-[#E8E2D6] text-slate-800 hover:bg-[#F4EFE6] gap-1.5 transition-all text-xs font-semibold flex-1 shadow-sm"
                                        >
                                            <Download className="w-3.5 h-3.5 text-amber-600" />
                                            Gerar PDF Timbrado
                                        </Button>

                                        {req.status === "PENDENTE" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusChange(req.id, "CONCLUIDO")}
                                                    disabled={isUpdating || deletingId === req.id}
                                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold shadow-sm transition-all"
                                                >
                                                    {isUpdating ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    )}
                                                    Concluir
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(req.id, "REJEITADO")}
                                                    disabled={isUpdating || deletingId === req.id}
                                                    title="Rejeitar solicitação"
                                                    className="rounded-xl bg-white border-[#E8E2D6] text-rose-600 hover:bg-rose-50 gap-1.5 transition-all"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                </Button>
                                            </>
                                        )}

                                        {/* Botão de Excluir */}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(req.id, req.patientName)}
                                            disabled={isUpdating || deletingId === req.id}
                                            title="Excluir permanentemente"
                                            className="rounded-xl bg-white border-[#E8E2D6] text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all px-2.5"
                                        >
                                            {deletingId === req.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* ═══ PAGINATION CONTROLS ═══ */}
                    <motion.div
                        variants={item}
                        className="bg-white border border-[#E8E2D6] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-700"
                    >
                        {/* Info & Items Per Page */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                Mostrando <span className="font-semibold text-slate-900">{startIndex + 1}</span> a{" "}
                                <span className="font-semibold text-slate-900">{endIndex}</span> de{" "}
                                <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
                                {filtered.length === 1 ? "solicitação" : "solicitações"}
                            </div>
                            <div className="flex items-center gap-2 border-l border-[#E8E2D6] pl-4">
                                <span>Exibir:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                    }}
                                    className="bg-[#FBF9F4] border border-[#E8E2D6] rounded-xl px-2 py-1 text-xs text-slate-800 focus:outline-none transition-colors cursor-pointer"
                                >
                                    <option value={6}>6 por página</option>
                                    <option value={10}>10 por página</option>
                                    <option value={20}>20 por página</option>
                                </select>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={safePage === 1}
                                    onClick={() => handlePageChange(safePage - 1)}
                                    title="Página anterior"
                                    className="w-8 h-8 rounded-xl bg-white border-[#E8E2D6] text-slate-700 hover:bg-[#F2ECE0] disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-1 px-1">
                                    {getPageNumbers().map((p, idx) =>
                                        typeof p === "number" ? (
                                            <button
                                                key={idx}
                                                onClick={() => handlePageChange(p)}
                                                className={cn(
                                                    "w-8 h-8 rounded-xl text-xs font-medium transition-all flex items-center justify-center",
                                                    safePage === p
                                                        ? "bg-[#1E2022] text-white font-semibold shadow-sm"
                                                        : "text-slate-700 hover:bg-[#F2ECE0]"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ) : (
                                            <span key={idx} className="w-6 text-center text-xs text-slate-500">
                                                {p}
                                            </span>
                                        )
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={safePage === totalPages}
                                    onClick={() => handlePageChange(safePage + 1)}
                                    title="Próxima página"
                                    className="w-8 h-8 rounded-xl bg-white border-[#E8E2D6] text-slate-700 hover:bg-[#F2ECE0] disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

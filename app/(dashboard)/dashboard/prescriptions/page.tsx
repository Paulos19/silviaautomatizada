"use client";

import { useState, useEffect } from "react";
import {
    fetchPrescriptionRequestsAction,
    updatePrescriptionStatusAction,
} from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Pill,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    CalendarDays,
    CreditCard,
    MapPin,
    FileText,
    Sparkles,
    AlertCircle,
    Search,
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
        <div class="value">${req.unimedCard}</div>
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
    const [filter, setFilter] = useState<"ALL" | "PENDENTE" | "CONCLUIDO" | "REJEITADO">("ALL");
    const [searchTerm, setSearchTerm] = useState("");

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

    const searchFilteredRequests = searchTerm === ""
        ? requests
        : requests.filter((r) =>
            r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.unimedCard.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const filtered = filter === "ALL" ? searchFilteredRequests : searchFilteredRequests.filter((r) => r.status === filter);

    const counts = {
        ALL: searchFilteredRequests.length,
        PENDENTE: searchFilteredRequests.filter((r) => r.status === "PENDENTE").length,
        CONCLUIDO: searchFilteredRequests.filter((r) => r.status === "CONCLUIDO").length,
        REJEITADO: searchFilteredRequests.filter((r) => r.status === "REJEITADO").length,
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full space-y-8 text-slate-200"
        >
            {/* ═══ HEADER ═══ */}
            <motion.div variants={item} className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-outfit font-semibold text-white tracking-tight">
                        Receitas
                    </h1>
                    <p className="text-sm font-inter text-slate-400 mt-2">
                        Solicitações de renovação de receita recebidas via WhatsApp.
                    </p>
                </div>

                {/* ═══ CONTROLS (SEARCH & FILTERS) ═══ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar paciente ou carteirinha..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-[#111A28]/80 backdrop-blur-xl border border-white/5 rounded-2xl text-sm font-inter text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/30 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center self-start sm:self-auto gap-1.5 bg-[#111A28]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-1 overflow-x-auto max-w-full">
                        {(["ALL", "PENDENTE", "CONCLUIDO", "REJEITADO"] as const).map((f) => {
                            const labels: Record<string, string> = {
                                ALL: "Todas",
                                PENDENTE: "Pendentes",
                                CONCLUIDO: "Concluídas",
                                REJEITADO: "Rejeitadas",
                            };
                            const colors: Record<string, string> = {
                                ALL: "teal",
                                PENDENTE: "amber",
                                CONCLUIDO: "emerald",
                                REJEITADO: "rose",
                            };
                            const isActive = filter === f;
                            const c = colors[f];
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-inter font-medium transition-all duration-300 flex items-center gap-1.5",
                                        isActive
                                            ? `bg-${c}-500/15 text-${c}-400 border border-${c}-500/30`
                                            : "text-slate-500 hover:text-slate-300 border border-transparent"
                                    )}
                                    style={
                                        isActive
                                            ? {
                                                backgroundColor: `color-mix(in srgb, var(--color-${c}-500, ${c === "teal" ? "#14b8a6" : c === "amber" ? "#f59e0b" : c === "emerald" ? "#10b981" : "#f43f5e"}) 15%, transparent)`,
                                                color: c === "teal" ? "#2dd4bf" : c === "amber" ? "#fbbf24" : c === "emerald" ? "#34d399" : "#fb7185",
                                                borderColor: `color-mix(in srgb, var(--color-${c}-500, ${c === "teal" ? "#14b8a6" : c === "amber" ? "#f59e0b" : c === "emerald" ? "#10b981" : "#f43f5e"}) 30%, transparent)`,
                                            }
                                            : undefined
                                    }
                                >
                                    {labels[f]}
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                        isActive ? "bg-white/10" : "bg-white/5"
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
                    <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                    <span className="ml-3 text-slate-400">Carregando solicitações...</span>
                </motion.div>
            )}

            {/* ═══ EMPTY STATE ═══ */}
            {!loading && filtered.length === 0 && (
                <motion.div
                    variants={item}
                    className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-12 flex flex-col items-center justify-center gap-5"
                >
                    <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                        <Pill className="w-8 h-8 text-teal-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-outfit font-semibold text-lg text-white">
                            Nenhuma solicitação
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 font-inter">
                            {filter === "ALL"
                                ? "Ainda não há solicitações de renovação de receita."
                                : `Nenhuma solicitação com status "${filter.toLowerCase()}".`}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ═══ CARDS ═══ */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filtered.map((req) => {
                        const status = statusConfig[req.status] || statusConfig.PENDENTE;
                        const StatusIcon = status.icon;
                        const isUpdating = updatingId === req.id;

                        return (
                            <motion.div
                                key={req.id}
                                variants={item}
                                className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 group hover:border-teal-500/20 transition-all duration-500 relative overflow-hidden"
                            >
                                {/* Glow */}
                                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                {/* Status + Date header */}
                                <div className="flex items-center justify-between mb-5 relative z-10">
                                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider", status.bg, status.border, status.color, "border")}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status.label}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        {formatDate(req.createdAt)}
                                    </div>
                                </div>

                                {/* Patient Info */}
                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <User className="w-5 h-5 text-teal-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-white font-outfit truncate">
                                                {req.patientName}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-inter mt-0.5">
                                                Nasc.: {req.birthDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                                            <CreditCard className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Carteirinha</p>
                                                <p className="text-sm text-slate-200 font-medium truncate">{req.unimedCard}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Endereço</p>
                                                <p className="text-sm text-slate-200 font-medium truncate">{req.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medications */}
                                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Pill className="w-3.5 h-3.5 text-emerald-400" />
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                                Medicamentos
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-inter">
                                            {req.medications}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/5 relative z-10">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => generatePrescriptionPDF(req)}
                                        className="rounded-xl bg-white/5 border-white/10 text-slate-300 hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-400 gap-1.5 transition-all flex-1"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Baixar PDF
                                    </Button>

                                    {req.status === "PENDENTE" && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusChange(req.id, "CONCLUIDO")}
                                                disabled={isUpdating}
                                                className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 gap-1.5 transition-all flex-1"
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
                                                disabled={isUpdating}
                                                className="rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 gap-1.5 transition-all"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import {
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  User,
  Phone,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  CheckCheck,
  X,
  ArrowUpRight,
  HelpCircle,
  FileText,
  AlertTriangle,
  Sun,
  Sunset,
  UserX
} from "lucide-react";
import {
  fetchUpcomingBookingsAction,
  dispatchSingleConfirmationAction,
  batchDispatchConfirmationsAction,
  confirmBookingInClinicAction,
  runMorningConfirmationDispatchAction,
  runAfternoonConfirmationDispatchAction,
  cancelUnconfirmedAppointmentsAndNotifyWaitlistAction,
  UpcomingBookingItem,
  UpcomingBookingsSummary,
  NoticeType,
} from "@/actions/confirmation.actions";

export default function DisparosPage() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<UpcomingBookingItem[]>([]);
  const [summary, setSummary] = useState<UpcomingBookingsSummary>({
    total: 0,
    pendingDispatch: 0,
    dispatchedCount: 0,
    confirmedCount: 0,
    todayCount: 0,
    tomorrowCount: 0,
    dayAfterCount: 0,
    pendingMorningCount: 0,
    pendingAfternoonNoticeCount: 0,
    pendingAfternoonReminderCount: 0,
  });

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"ALL" | "MORNING_8H" | "AFTERNOON_24H_AVISO" | "AFTERNOON_24H_LEMBRETE" | "TODAY" | "TOMORROW" | "DAY_AFTER">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "PENDING" | "DISPATCHED" | "CONFIRMED">("ALL");
  const [selectedInsurance, setSelectedInsurance] = useState<string>("ALL");

  // Paginação: 5 itens por página para manter o viewport limpo e fluido
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal de Preview da Mensagem WhatsApp
  const [previewBooking, setPreviewBooking] = useState<UpcomingBookingItem | null>(null);
  const [isDispatchingSingle, setIsDispatchingSingle] = useState(false);
  const [isExecutingRoutine, setIsExecutingRoutine] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Carrega agendamentos
  const loadData = () => {
    setIsLoading(true);
    startTransition(async () => {
      const res = await fetchUpcomingBookingsAction(4);
      setIsLoading(false);
      if (res.success && res.data) {
        setBookings(res.data.bookings);
        setSummary(res.data.summary);
      } else {
        showToast(res.error || "Erro ao consultar agendamentos da Clinic API", "error");
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lista única de convênios para o filtro
  const insuranceOptions = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.healthInsurance) set.add(b.healthInsurance);
    });
    return Array.from(set);
  }, [bookings]);

  // Filtragem
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Busca texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.patientName.toLowerCase().includes(q) || b.client.toLowerCase().includes(q);
        const matchesPhone = b.mobile.includes(q) || b.formattedPhone.includes(q);
        const matchesId = b.id.includes(q);
        if (!matchesName && !matchesPhone && !matchesId) return false;
      }

      // Filtro de Abas Operacionais
      if (selectedTab === "MORNING_8H") {
        if (b.suggestedScheduleTime !== "08:00") return false;
      } else if (selectedTab === "AFTERNOON_24H_AVISO") {
        if (b.suggestedScheduleTime !== "16:00" || b.targetNoticeType !== "24H_AVISO") return false;
      } else if (selectedTab === "AFTERNOON_24H_LEMBRETE") {
        if (b.suggestedScheduleTime !== "16:00" || b.targetNoticeType !== "24H_LEMBRETE") return false;
      } else if (selectedTab === "TODAY") {
        if (b.dayOffset !== 0) return false;
      } else if (selectedTab === "TOMORROW") {
        if (b.dayOffset !== 1) return false;
      } else if (selectedTab === "DAY_AFTER") {
        if (b.dayOffset < 2) return false;
      }

      // Status
      if (selectedStatus === "PENDING" && b.isDispatched) return false;
      if (selectedStatus === "DISPATCHED" && !b.isDispatched) return false;
      if (selectedStatus === "CONFIRMED" && !b.confirm.toLowerCase().includes("confirmado")) return false;

      // Convênio
      if (selectedInsurance !== "ALL" && b.healthInsurance !== selectedInsurance) {
        return false;
      }

      return true;
    });
  }, [bookings, searchQuery, selectedTab, selectedStatus, selectedInsurance]);

  // Paginação
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTab, selectedStatus, selectedInsurance]);

  // Ação: Disparar individual
  const handleDispatchSingle = async (booking: UpcomingBookingItem) => {
    setIsDispatchingSingle(true);
    const res = await dispatchSingleConfirmationAction({
      id: booking.id,
      client: booking.client,
      mobile: booking.mobile,
      dateSchedule: booking.dateSchedule,
      hourSchedule: booking.hourSchedule,
      doctorName: booking.doctorName,
      healthInsurance: booking.healthInsurance,
      dayOffset: booking.dayOffset,
      noticeType: booking.targetNoticeType,
      customMessage: booking.previewMessage,
    });
    setIsDispatchingSingle(false);

    if (res.success) {
      showToast(res.message || "Confirmação enviada com sucesso!", "success");
      setPreviewBooking(null);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? { ...b, isDispatched: true, dispatchStatus: "ENVIADO", lastDispatchedAt: new Date().toISOString() }
            : b
        )
      );
      setSummary((prev) => ({
        ...prev,
        pendingDispatch: Math.max(0, prev.pendingDispatch - 1),
        dispatchedCount: prev.dispatchedCount + 1,
      }));
    } else {
      showToast(res.error || "Falha ao enviar confirmação", "error");
    }
  };

  // Ação: Confirmar na Clínica
  const handleConfirmInClinic = async (booking: UpcomingBookingItem) => {
    startTransition(async () => {
      const res = await confirmBookingInClinicAction(booking.id);
      if (res.success) {
        showToast(`Agendamento de ${booking.firstName} confirmado no sistema da clínica!`, "success");
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, confirm: "Confirmado" } : b))
        );
        setSummary((prev) => ({
          ...prev,
          confirmedCount: prev.confirmedCount + 1,
        }));
      } else {
        showToast(res.error || "Falha ao confirmar na clínica", "error");
      }
    });
  };

  // Ação: Disparo da Rotina Matinal (08h00)
  const handleRunMorningRoutine = async () => {
    setIsExecutingRoutine("morning");
    const res = await runMorningConfirmationDispatchAction();
    setIsExecutingRoutine(null);

    if (res.skipped) {
      showToast(res.message || "Fim de semana: disparos suspensos.", "error");
      return;
    }

    if (res.success) {
      showToast(
        `Rotina das 08h00 executada! ${res.data?.dispatched || 0} enviados, ${res.data?.cancellationsProcessed || 0} cancelamentos processados.`,
        "success"
      );
      loadData();
    } else {
      showToast(res.error || "Falha ao executar rotina das 08h00", "error");
    }
  };

  // Ação: Disparo da Rotina Vespertina (16h00 - 24h)
  const handleRunAfternoonRoutine = async () => {
    setIsExecutingRoutine("afternoon");
    const res = await runAfternoonConfirmationDispatchAction();
    setIsExecutingRoutine(null);

    if (res.skipped) {
      showToast(res.message || "Fim de semana: disparos suspensos.", "error");
      return;
    }

    if (res.success) {
      showToast(
        `Rotina das 16h00 executada! ${res.data?.dispatched || 0} mensagens de 24h disparadas.`,
        "success"
      );
      loadData();
    } else {
      showToast(res.error || "Falha ao executar rotina das 16h00", "error");
    }
  };

  // Ação: Cancelamento de Não Confirmados & Encaixe de Lista de Espera
  const handleRunCancellations = async () => {
    if (!confirm("Deseja cancelar todas as consultas de hoje não confirmadas e ofertar as vagas à lista de espera agora?")) {
      return;
    }

    setIsExecutingRoutine("cancellations");
    const res = await cancelUnconfirmedAppointmentsAndNotifyWaitlistAction();
    setIsExecutingRoutine(null);

    if (res.success) {
      showToast(
        `Processamento concluído: ${res.cancelledCount} consultas canceladas por inação, ${res.waitlistNotifiedCount} vagas ofertadas para a lista de espera!`,
        "success"
      );
      loadData();
    } else {
      showToast(res.error || "Erro ao processar cancelamentos", "error");
    }
  };

  // Ação: Disparar em Lote para Todos os Pendentes Visíveis
  const handleBatchDispatch = async () => {
    const pendings = filteredBookings.filter((b) => !b.isDispatched && b.mobile);
    if (!pendings.length) {
      showToast("Não há agendamentos pendentes com telefone válido no filtro atual.", "error");
      return;
    }

    if (!confirm(`Deseja disparar confirmações para ${pendings.length} paciente(s) agora?`)) {
      return;
    }

    setIsLoading(true);
    const res = await batchDispatchConfirmationsAction(pendings);
    setIsLoading(false);

    if (res.success) {
      showToast(`Disparos concluídos: ${res.dispatched} enviados com sucesso, ${res.errors} erros.`, "success");
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1E1E1E] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-[#064E3B]/95 text-white border-emerald-500/30"
              : "bg-red-900/95 text-white border-red-500/30"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#064E3B] text-white flex items-center justify-center shadow-md shadow-[#064E3B]/10">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1E1E1E]">Central de Disparos</h1>
              <p className="text-xs text-[#6B7280]">
                Lembretes às <b>08h00</b> (48h e antecipações) e às <b>16h00</b> (24h com cancelamento automático e repasse à lista).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            disabled={isLoading || isPending}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E8E2D6] text-xs font-semibold text-[#374151] hover:bg-[#F3EFE6] transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Atualizar dados da Clinic API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isPending ? "animate-spin text-[#064E3B]" : ""}`} />
            <span>Atualizar</span>
          </button>

          {/* Botão Rotina 08h00 */}
          <button
            onClick={handleRunMorningRoutine}
            disabled={isExecutingRoutine !== null}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Executar disparos das 08h00 (48h e antecipações de sexta-feira)"
          >
            <Sun className={`w-3.5 h-3.5 text-amber-600 ${isExecutingRoutine === "morning" ? "animate-spin" : ""}`} />
            <span>Disparar 08:00 (Manhã)</span>
          </button>

          {/* Botão Rotina 16h00 */}
          <button
            onClick={handleRunAfternoonRoutine}
            disabled={isExecutingRoutine !== null}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold hover:bg-indigo-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Executar disparos das 16h00 (24h antes: 2º aviso urgente ou lembrete passivo)"
          >
            <Sunset className={`w-3.5 h-3.5 text-indigo-600 ${isExecutingRoutine === "afternoon" ? "animate-spin" : ""}`} />
            <span>Disparar 16:00 (Tarde)</span>
          </button>

          {/* Botão Cancelamento por Inação & Repasse */}
          <button
            onClick={handleRunCancellations}
            disabled={isExecutingRoutine !== null}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold hover:bg-rose-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Cancelar consultas não confirmadas de hoje e ofertar vagas à lista de espera"
          >
            <UserX className={`w-3.5 h-3.5 text-rose-600 ${isExecutingRoutine === "cancellations" ? "animate-spin" : ""}`} />
            <span>Cancelar & Encaixar Lista</span>
          </button>

          {/* Botão Disparar Pendentes do Filtro */}
          <button
            onClick={handleBatchDispatch}
            disabled={isLoading || isPending || summary.pendingDispatch === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-semibold hover:bg-[#064E3B]/90 transition-all shadow-md shadow-[#064E3B]/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Disparar Filtro ({summary.pendingDispatch})</span>
          </button>
        </div>
      </div>

      {/* Bento Grid de Métricas Operacionais */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D6] shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Monitorado</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EFE6] text-[#064E3B] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">{summary.total}</span>
            <span className="text-xs text-[#9CA3AF]">consultas</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-[#6B7280]">
            <span>Hoje: <b>{summary.todayCount}</b></span>
            <span>•</span>
            <span>Amanhã: <b>{summary.tomorrowCount}</b></span>
          </div>
        </div>

        {/* Card 2: 08h00 Pendentes (48h e Antecipações) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-[0_2px_12px_rgba(245,158,11,0.05)] relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">08:00 (1º Aviso 48h)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">{summary.pendingMorningCount}</span>
            <span className="text-xs text-amber-700">pendentes</span>
          </div>
          <p className="mt-2 text-[10px] text-amber-800/80">
            Disparos de 48h e antecipações de sexta
          </p>
        </div>

        {/* Card 3: 16h00 Lembrete 24h (Não confirmados) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-[0_2px_12px_rgba(245,158,11,0.05)] relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">16:00 (Lembrete 24h)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">{summary.pendingAfternoonNoticeCount}</span>
            <span className="text-xs text-amber-700">não confirmados</span>
          </div>
          <p className="mt-2 text-[10px] text-amber-800/80">
            Lembrete cordial para consultas de amanhã
          </p>
        </div>

        {/* Card 4: 16h00 Lembretes Passivos (Confirmados) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-200/80 shadow-[0_2px_12px_rgba(99,102,241,0.05)] relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">16:00 (Lembretes)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sunset className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-900">{summary.pendingAfternoonReminderCount}</span>
            <span className="text-xs text-indigo-700">já confirmados</span>
          </div>
          <p className="mt-2 text-[10px] text-indigo-800/80">
            Lembrete amigável sem resposta necessária
          </p>
        </div>

        {/* Card 5: Confirmados */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-[0_2px_12px_rgba(16,185,129,0.05)] relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Confirmados</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{summary.confirmedCount}</span>
            <span className="text-xs text-emerald-700">presenças</span>
          </div>
          <p className="mt-2 text-[10px] text-emerald-800/80">
            Disparados no total: {summary.dispatchedCount}
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E2D6] shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Busca por texto */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por paciente, telefone ou ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E8E2D6] bg-[#FBF9F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Pílulas de Abas Operacionais */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
          <button
            onClick={() => setSelectedTab("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedTab === "ALL"
                ? "bg-[#064E3B] text-white shadow-sm"
                : "bg-[#F3EFE6] text-[#374151] hover:bg-[#E8E2D6]"
            }`}
          >
            Todos ({bookings.length})
          </button>
          <button
            onClick={() => setSelectedTab("MORNING_8H")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedTab === "MORNING_8H"
                ? "bg-amber-700 text-white shadow-sm"
                : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>08:00 (1º Aviso 48h)</span>
          </button>
          <button
            onClick={() => setSelectedTab("AFTERNOON_24H_AVISO")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedTab === "AFTERNOON_24H_AVISO"
                ? "bg-rose-700 text-white shadow-sm"
                : "bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>16:00 (2º Aviso Urgente)</span>
          </button>
          <button
            onClick={() => setSelectedTab("AFTERNOON_24H_LEMBRETE")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedTab === "AFTERNOON_24H_LEMBRETE"
                ? "bg-indigo-700 text-white shadow-sm"
                : "bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100"
            }`}
          >
            <Sunset className="w-3.5 h-3.5" />
            <span>16:00 (Lembretes)</span>
          </button>
          <button
            onClick={() => setSelectedTab("TODAY")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedTab === "TODAY"
                ? "bg-[#064E3B] text-white shadow-sm"
                : "bg-[#F3EFE6] text-[#374151] hover:bg-[#E8E2D6]"
            }`}
          >
            Hoje ({summary.todayCount})
          </button>
          <button
            onClick={() => setSelectedTab("TOMORROW")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedTab === "TOMORROW"
                ? "bg-[#064E3B] text-white shadow-sm"
                : "bg-[#F3EFE6] text-[#374151] hover:bg-[#E8E2D6]"
            }`}
          >
            Amanhã ({summary.tomorrowCount})
          </button>
        </div>

        {/* Selects de Status e Convênio */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E8E2D6] bg-[#FBF9F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 text-[#374151] font-medium"
          >
            <option value="ALL">Status: Todos</option>
            <option value="PENDING">Aguardando Disparo</option>
            <option value="DISPATCHED">Já Disparados</option>
            <option value="CONFIRMED">Confirmados</option>
          </select>

          {insuranceOptions.length > 0 && (
            <select
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#E8E2D6] bg-[#FBF9F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 text-[#374151] font-medium"
            >
              <option value="ALL">Convênio: Todos</option>
              {insuranceOptions.map((ins) => (
                <option key={ins} value={ins}>
                  {ins}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Lista / Tabela de Agendamentos */}
      <div className="bg-white rounded-2xl border border-[#E8E2D6] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#064E3B] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#374151]">Consultando agenda do Dr. Marco Antonio na Clinic API...</p>
            <p className="text-xs text-[#9CA3AF]">Calculando janelas de 08h00 (48h) e 16h00 (24h) com regras de fim de semana.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EFE6] text-[#064E3B] flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1E1E1E]">Nenhum agendamento encontrado</h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              Não foram encontrados agendamentos para o filtro selecionado. Alterne as abas ou limpe a busca.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E2D6]/60">
            {paginatedBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-[#FBF9F4]/60 transition-colors"
              >
                {/* Informações Principais do Paciente */}
                <div className="flex items-start gap-3.5 min-w-[280px]">
                  <div className="w-10 h-10 rounded-2xl bg-[#F3EFE6] text-[#064E3B] flex items-center justify-center font-bold text-sm shrink-0 border border-[#E8E2D6]">
                    {b.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[#1E1E1E]">{b.patientName}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F3EFE6] text-[#6B7280]">
                        #{b.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {b.healthInsurance}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#6B7280] flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-[#9CA3AF]" />
                        {b.formattedPhone || "Sem telefone"}
                      </span>
                      <span>•</span>
                      <span className="text-[#374151] font-medium">{b.doctorName}</span>
                    </div>
                  </div>
                </div>

                {/* Data, Horário e Tipo de Aviso */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#1E1E1E]">
                      <Calendar className="w-3.5 h-3.5 text-[#064E3B]" />
                      <span>{b.dateSchedule}</span>
                      <span className="text-[#9CA3AF]">às</span>
                      <span className="text-[#064E3B] font-mono text-sm">{b.hourSchedule}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Tag do Dia */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.dayOffset === 0
                            ? "bg-purple-100 text-purple-800"
                            : b.dayOffset === 1
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {b.dayLabel}
                      </span>

                      {/* Tag do Tipo de Aviso Programado */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.targetNoticeType === "24H_AVISO"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : b.targetNoticeType === "24H_LEMBRETE"
                            ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                            : b.targetNoticeType === "ANTECIPADO_SEXTA"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {b.suggestedScheduleTime === "16:00" ? (
                          <Sunset className="w-3 h-3" />
                        ) : (
                          <Sun className="w-3 h-3" />
                        )}
                        <span>{b.suggestedScheduleTime} • {b.noticeTitle}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status da Clinic e Status do Disparo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs">
                  {/* Status na Clinic */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                      b.confirm.toLowerCase().includes("confirmado")
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {b.confirm.toLowerCase().includes("confirmado") ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-gray-400" />
                    )}
                    {b.confirm}
                  </span>

                  {/* Status do Disparo */}
                  {b.isDispatched ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Disparado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Pendente
                    </span>
                  )}
                </div>

                {/* Botões de Ação Imediata */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Botão Ver Mensagem / Preview */}
                  <button
                    onClick={() => setPreviewBooking(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D6] text-xs font-semibold text-[#374151] hover:bg-[#F3EFE6] transition-all shadow-sm"
                    title="Pré-visualizar mensagem que será enviada"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#064E3B]" />
                    <span>Ver Mensagem</span>
                  </button>

                  {/* Botão Disparar Agora */}
                  <button
                    onClick={() => handleDispatchSingle(b)}
                    disabled={isDispatchingSingle || !b.mobile}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                      b.isDispatched
                        ? "bg-[#F3EFE6] text-[#6B7280] hover:bg-[#E8E2D6]"
                        : "bg-[#064E3B] text-white hover:bg-[#064E3B]/90 shadow-[#064E3B]/10"
                    }`}
                    title={
                      b.isDispatched
                        ? "Reenviar confirmação via WhatsApp"
                        : "Disparar agora via WhatsApp"
                    }
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{b.isDispatched ? "Reenviar" : "Disparar"}</span>
                  </button>

                  {/* Botão Confirmar na Clínica */}
                  {!b.confirm.toLowerCase().includes("confirmado") && (
                    <button
                      onClick={() => handleConfirmInClinic(b)}
                      className="p-1.5 rounded-xl bg-white border border-[#E8E2D6] text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                      title="Marcar como Confirmado no sistema Clinic"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {!isLoading && filteredBookings.length > 0 && (
          <div className="p-4 border-t border-[#E8E2D6] bg-[#FBF9F4]/40 flex items-center justify-between text-xs text-[#6B7280]">
            <div>
              Mostrando <b>{(currentPage - 1) * itemsPerPage + 1}</b> a{" "}
              <b>{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</b> de{" "}
              <b>{filteredBookings.length}</b> agendamentos
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#E8E2D6] bg-white text-[#374151] hover:bg-[#F3EFE6] disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-[#1E1E1E]">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#E8E2D6] bg-white text-[#374151] hover:bg-[#F3EFE6] disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Pré-visualização WhatsApp Fiel */}
      {previewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FBF9F4] rounded-3xl max-w-lg w-full border border-[#E8E2D6] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8E2D6] bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1E1E]">Preview do Disparo WhatsApp</h3>
                  <p className="text-[11px] text-[#6B7280]">
                    Tipo: <b>{previewBooking.noticeTitle}</b> ({previewBooking.suggestedScheduleTime})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewBooking(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist de Validação */}
            <div className="p-3.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Paciente: <b>{previewBooking.firstName}</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Data: <b>{previewBooking.dateSchedule}</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Horário: <b>{previewBooking.hourSchedule}</b></span>
              </div>
            </div>

            {/* Balão WhatsApp Simulado com o Texto Real */}
            <div className="p-5 bg-[#EFEAE2] min-h-[260px] flex flex-col justify-center">
              <div className="max-w-[95%] bg-white rounded-2xl rounded-tl-sm p-4 shadow-md text-xs text-[#1E1E1E] space-y-2 relative border border-[#000000]/5 leading-relaxed whitespace-pre-line font-sans">
                {previewBooking.previewMessage}
                <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 pt-1">
                  <span>{previewBooking.suggestedScheduleTime}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-[#E8E2D6] flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#6B7280]">
                Destino: <b className="font-mono text-[#1E1E1E]">{previewBooking.formattedPhone}</b>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewBooking(null)}
                  className="px-4 py-2 rounded-xl border border-[#E8E2D6] text-xs font-semibold text-[#374151] hover:bg-[#F3EFE6] transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => handleDispatchSingle(previewBooking)}
                  disabled={isDispatchingSingle || !previewBooking.mobile}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-semibold hover:bg-[#064E3B]/90 transition-all shadow-md shadow-[#064E3B]/20 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDispatchingSingle ? "Enviando..." : "Confirmar e Disparar"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  FileText
} from "lucide-react";
import {
  fetchUpcomingBookingsAction,
  dispatchSingleConfirmationAction,
  batchDispatchConfirmationsAction,
  confirmBookingInClinicAction,
  UpcomingBookingItem,
  UpcomingBookingsSummary,
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
  });

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<"ALL" | 0 | 1 | 2>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "PENDING" | "DISPATCHED" | "CONFIRMED">("ALL");
  const [selectedInsurance, setSelectedInsurance] = useState<string>("ALL");

  // Paginação: 5 itens por página para manter o viewport limpo e fluido
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal de Preview da Mensagem WhatsApp
  const [previewBooking, setPreviewBooking] = useState<UpcomingBookingItem | null>(null);
  const [isDispatchingSingle, setIsDispatchingSingle] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Carrega agendamentos
  const loadData = () => {
    setIsLoading(true);
    startTransition(async () => {
      const res = await fetchUpcomingBookingsAction(2);
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

      // Dia
      if (selectedDay !== "ALL" && b.dayOffset !== selectedDay) {
        return false;
      }

      // Status
      if (selectedStatus === "PENDING" && b.isDispatched) return false;
      if (selectedStatus === "DISPATCHED" && !b.isDispatched) return false;
      if (selectedStatus === "CONFIRMED" && b.confirm !== "Confirmado") return false;

      // Convênio
      if (selectedInsurance !== "ALL" && b.healthInsurance !== selectedInsurance) {
        return false;
      }

      return true;
    });
  }, [bookings, searchQuery, selectedDay, selectedStatus, selectedInsurance]);

  // Paginação
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDay, selectedStatus, selectedInsurance]);

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
    });
    setIsDispatchingSingle(false);

    if (res.success) {
      showToast(res.message || "Confirmação enviada com sucesso!", "success");
      setPreviewBooking(null);
      // Atualiza localmente
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#064E3B] text-white flex items-center justify-center shadow-md shadow-[#064E3B]/10">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1E1E1E]">Central de Disparos</h1>
              <p className="text-xs text-[#6B7280]">
                Monitoramento de agendamentos próximos (D+0 a D+2) e disparo antecipado à rotina da Silv.IA.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Badge Informativo da Rotina */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Disparo Automático às 08h00 (24h/48h)
          </div>

          <button
            onClick={loadData}
            disabled={isLoading || isPending}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D6] text-xs font-semibold text-[#374151] hover:bg-[#F3EFE6] transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Atualizar dados da Clinic API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isPending ? "animate-spin text-[#064E3B]" : ""}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleBatchDispatch}
            disabled={isLoading || isPending || summary.pendingDispatch === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-semibold hover:bg-[#064E3B]/90 transition-all shadow-md shadow-[#064E3B]/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Disparar Pendentes ({summary.pendingDispatch})</span>
          </button>
        </div>
      </div>

      {/* Bento Grid de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D6] shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total de Consultas</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EFE6] text-[#064E3B] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">{summary.total}</span>
            <span className="text-xs text-[#9CA3AF]">próximos 3 dias</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#6B7280]">
            <span>Hoje: <b>{summary.todayCount}</b></span>
            <span>•</span>
            <span>Amanhã: <b>{summary.tomorrowCount}</b></span>
            <span>•</span>
            <span>D+2: <b>{summary.dayAfterCount}</b></span>
          </div>
        </div>

        {/* Card 2: Pendentes */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-[0_2px_12px_rgba(245,158,11,0.05)] relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Aguardando Disparo</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">{summary.pendingDispatch}</span>
            <span className="text-xs text-amber-700">pacientes</span>
          </div>
          <p className="mt-2 text-[11px] text-amber-800/80">
            Podem ser disparados agora ou pela Silvia às 08h
          </p>
        </div>

        {/* Card 3: Disparados */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-[0_2px_12px_rgba(16,185,129,0.05)] relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Disparados via WhatsApp</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{summary.dispatchedCount}</span>
            <span className="text-xs text-emerald-700">notificados</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-800/80">
            Histórico registrado na memória da Silvia
          </p>
        </div>

        {/* Card 4: Confirmados */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200/80 shadow-[0_2px_12px_rgba(59,130,246,0.05)] relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Confirmados na Clínica</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-900">{summary.confirmedCount}</span>
            <span className="text-xs text-blue-700">presenças confirmadas</span>
          </div>
          <p className="mt-2 text-[11px] text-blue-800/80">
            Status oficial atualizado na agenda
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E2D6] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
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

        {/* Pílulas de Dia */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setSelectedDay("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedDay === "ALL"
                ? "bg-[#064E3B] text-white shadow-sm"
                : "bg-[#F3EFE6] text-[#374151] hover:bg-[#E8E2D6]"
            }`}
          >
            Todos os Dias ({bookings.length})
          </button>
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedDay === 0
                ? "bg-[#064E3B] text-white shadow-sm"
                : "bg-[#F3EFE6] text-[#374151] hover:bg-[#E8E2D6]"
            }`}
          >
            Hoje ({summary.todayCount})
          </button>
          <button
            onClick={() => setSelectedDay(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedDay === 1
                ? "bg-[#064E3B] text-white shadow-sm"
                : "bg-[#F3EFE6] text-[#374151] hover:bg-[#E8E2D6]"
            }`}
          >
            Amanhã - 24h ({summary.tomorrowCount})
          </button>
          <button
            onClick={() => setSelectedDay(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedDay === 2
                ? "bg-[#064E3B] text-white shadow-sm"
                : "bg-[#F3EFE6] text-[#374151] hover:bg-[#E8E2D6]"
            }`}
          >
            D+2 - 48h ({summary.dayAfterCount})
          </button>
        </div>

        {/* Selects de Status e Convênio */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E8E2D6] bg-[#FBF9F4]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 text-[#374151] font-medium"
          >
            <option value="ALL">Todos os Status</option>
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
              <option value="ALL">Todos Convênios</option>
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
            <p className="text-xs text-[#9CA3AF]">Validando nomes reais, telefones e horários das próximas 48 horas.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EFE6] text-[#064E3B] flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1E1E1E]">Nenhum agendamento encontrado</h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              Não foram encontrados agendamentos para os filtros selecionados. Tente alterar o período ou limpar a busca.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E2D6]/60">
            {paginatedBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FBF9F4]/60 transition-colors"
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

                {/* Data, Horário e Tag do Dia */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#1E1E1E]">
                      <Calendar className="w-3.5 h-3.5 text-[#064E3B]" />
                      <span>{b.dateSchedule}</span>
                      <span className="text-[#9CA3AF]">às</span>
                      <span className="text-[#064E3B] font-mono text-sm">{b.hourSchedule}</span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.dayOffset === 0
                            ? "bg-purple-100 text-purple-800"
                            : b.dayOffset === 1
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {b.dayLabel} {b.dayOffset === 1 ? "(24h)" : b.dayOffset === 2 ? "(48h)" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status da Clinic e Status do Disparo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs">
                  {/* Status na Clinic */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                      b.confirm === "Confirmado"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {b.confirm === "Confirmado" ? (
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
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
                  {/* Botão Ver Template / Preview */}
                  <button
                    onClick={() => setPreviewBooking(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D6] text-xs font-semibold text-[#374151] hover:bg-[#F3EFE6] transition-all shadow-sm"
                    title="Pré-visualizar mensagem que será enviada"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#064E3B]" />
                    <span>Ver Mensagem</span>
                  </button>

                  {/* Botão Disparar Agora (Antes da Silvia) */}
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
                        : "Disparar agora via WhatsApp (antes das 08h da Silvia)"
                    }
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{b.isDispatched ? "Reenviar" : "Disparar Agora"}</span>
                  </button>

                  {/* Botão Confirmar na Clínica */}
                  {b.confirm !== "Confirmado" && (
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

        {/* Paginação (5 itens por página para manter vh padrão) */}
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
                  <h3 className="text-sm font-bold text-[#1E1E1E]">Preview do Disparo de Confirmação</h3>
                  <p className="text-[11px] text-[#6B7280]">
                    Validação de dados para: <b>{previewBooking.patientName}</b>
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

            {/* Checklist de Validação Anti-Erros */}
            <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nome extraído: <b>{previewBooking.firstName}</b></span>
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

            {/* Balão WhatsApp Simulado */}
            <div className="p-5 bg-[#EFEAE2] min-h-[260px] flex flex-col justify-center">
              <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-sm p-4 shadow-md text-xs text-[#1E1E1E] space-y-2 relative border border-[#000000]/5 leading-relaxed">
                <p>
                  Olá, <b>{previewBooking.firstName}</b>! Tudo bem? 😊
                </p>
                <p>Aqui é a Silv.IA do consultório do Dr. Marco Antonio.</p>
                <p>
                  Passando para confirmar sua consulta agendada para o dia{" "}
                  <b className="text-[#064E3B]">{previewBooking.dateSchedule}</b> às{" "}
                  <b className="text-[#064E3B]">{previewBooking.hourSchedule}</b>.
                </p>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1 text-[11px] text-gray-700">
                  <p className="font-bold text-gray-900">📍 Nosso endereço:</p>
                  <p>Rua Dr. Roberto Barrozo, 1379, 2º andar</p>
                  <p>Hospital Otorrinos Curitiba</p>
                  <a
                    href="https://maps.google.com/?q=-25.415823,-49.282524"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-medium mt-1"
                  >
                    Ver no Google Maps <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
                <p className="pt-1">Você confirma sua presença para este dia?</p>

                <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 pt-1">
                  <span>Agora</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-[#E8E2D6] flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#6B7280]">
                Destinatário: <b className="font-mono text-[#1E1E1E]">{previewBooking.formattedPhone}</b>
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
                  <span>{isDispatchingSingle ? "Enviando..." : "Confirmar e Disparar Agora"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

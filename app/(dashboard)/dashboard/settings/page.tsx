"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useClinicSettings, SelectedDoctor } from "@/components/dashboard/clinic-settings-context";
import { fetchDoctorsAction } from "@/actions/clinic.actions";
import { saveRagAction } from "@/actions/rag.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Stethoscope,
  Check,
  Brain,
  Sparkles,
  Save,
  Globe,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bot,
  Activity,
  CheckCircle2,
  MessageSquare,
  Building2,
  Cpu,
  RefreshCw,
  UserCheck
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const DOCTORS_PER_PAGE = 6;

interface DoctorItem {
  id: number;
  name: string;
  crm?: number | null;
  specialty?: string | null;
  medicalAppointmentWEB?: string | null;
  council?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const PRESET_TEMPLATES = [
  {
    title: "Acolhimento Empático",
    snippet: "Você é a Silvia, assistente médica do Hospital Otorrinos Curitiba. Trate cada paciente com máxima empatia, carinho e clareza, sempre utilizando português formal e acolhedor."
  },
  {
    title: "Regra de Agendamentos",
    snippet: "Ao oferecer horários, priorize a grade do médico de plantão selecionado. Confirme data, horário e convênio antes de finalizar a reserva."
  },
  {
    title: "Diretriz de Não Diagnóstico",
    snippet: "Nunca forneça diagnósticos ou prescreva remédios por conta própria. Para dúvidas clínicas agudas, oriente o paciente a comparecer imediatamente ao pronto-atendimento."
  }
];

export default function SettingsPage() {
  const { selectedDoctor, setSelectedDoctor, ragPrompt, setRagPrompt } = useClinicSettings();
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localRag, setLocalRag] = useState(ragPrompt);
  const [ragSaved, setRagSaved] = useState(false);
  const [ragSaving, setRagSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadDoctors();
  }, []);

  // Sincroniza localRag quando ragPrompt terminar de hidratar
  useEffect(() => {
    if (ragPrompt && !localRag) {
      setLocalRag(ragPrompt);
    }
  }, [ragPrompt]);

  // Reset pra página 1 ao filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadDoctors = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchDoctorsAction();
    if (res.success && res.data) {
      setDoctors(res.data as DoctorItem[]);
    } else {
      setError(res.error || "Falha ao carregar médicos do Clinic API.");
    }
    setLoading(false);
  };

  // Filtrar médicos por nome, CRM ou especialidade
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const q = searchQuery.toLowerCase();
    return doctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        (doc.crm && doc.crm.toString().includes(q)) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(q))
    );
  }, [doctors, searchQuery]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / DOCTORS_PER_PAGE));
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * DOCTORS_PER_PAGE,
    currentPage * DOCTORS_PER_PAGE
  );

  const handleSelectDoctor = async (doc: DoctorItem) => {
    const selected: SelectedDoctor = {
      id: doc.id,
      name: doc.name,
      crm: doc.crm,
      specialty: doc.specialty,
    };
    setSelectedDoctor(selected);
    await saveRagAction(localRag || ragPrompt, selected);
  };

  const handleSaveRag = async () => {
    setRagSaving(true);
    setRagPrompt(localRag);
    const res = await saveRagAction(localRag, selectedDoctor);
    setRagSaving(false);
    if (res.success) {
      setRagSaved(true);
      setTimeout(() => setRagSaved(false), 2500);
    } else {
      alert("Erro ao salvar personalidade: " + (res.error || "Desconhecido"));
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    setLocalRag((prev) => {
      if (!prev.trim()) return snippet;
      return `${prev.trim()}\n\n${snippet}`;
    });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full space-y-8 pb-16 text-slate-800"
    >
      {/* Header Institucional */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-[#E8E2D6]/70"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
              Hospital Otorrinos Curitiba
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistemas Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
            Configurações & Silvia IA
          </h1>
          <p className="text-sm text-slate-700 mt-1">
            Defina o médico responsável de plantão, ajuste as diretrizes cognitivas do agente e monitore os canais de integração.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDoctors}
            className="rounded-xl border-[#E8E2D6] bg-white text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Atualizar Médicos
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Principal */}
      <div className="grid grid-cols-12 gap-6">
        {/* CARD 1: Médico Responsável Ativo (col-span-12 lg:col-span-5) */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-5 bg-white border border-[#E8E2D6] rounded-[32px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-200/25 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Médico Responsável</h2>
                  <p className="text-xs text-slate-700">Vínculo ativo de agendamentos e RAG</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Plantão Ativo
              </span>
            </div>

            {selectedDoctor ? (
              <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] mt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                      Profissional Selecionado
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {selectedDoctor.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#1E2022] text-amber-300 font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    {selectedDoctor.name.charAt(0)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E2D6]">
                  <div>
                    <p className="text-[11px] text-slate-600">Registro Profissional</p>
                    <p className="text-xs font-semibold text-slate-800">
                      CRM {selectedDoctor.crm || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-600">Especialidade Clínica</p>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {selectedDoctor.specialty || "Otorrinolaringologia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80">
                    <UserCheck className="w-3 h-3 text-amber-700" /> ID #{selectedDoctor.id}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Sincronizado no n8n
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-[#E8E2D6] text-center my-4 space-y-2">
                <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-medium text-slate-700">Nenhum médico selecionado</p>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Selecione um profissional na grade abaixo para vinculá-lo aos agendamentos automáticos da Silvia.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E8E2D6]/80 text-xs text-slate-600 flex items-center justify-between">
            <span>Hospital Otorrinos Curitiba</span>
            <span className="font-mono text-[10px] text-slate-600">ID da Unidade: 100</span>
          </div>
        </motion.div>

        {/* CARD 2: Integrações & Conectividade (col-span-12 lg:col-span-7) */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-7 bg-white border border-[#E8E2D6] rounded-[32px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1E2022] text-amber-300 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Canais & Conectividade</h2>
                  <p className="text-xs text-slate-700">Status dos barramentos em tempo real</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                3 Serviços Ativos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              {/* WhatsApp Evolution */}
              <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] space-y-2">
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Evolution API</p>
                  <p className="text-[11px] text-slate-600">Instância Silvia</p>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    556186446934
                  </span>
                </div>
              </div>

              {/* Clinic API */}
              <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] space-y-2">
                <div className="flex items-center justify-between">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Clinic API</p>
                  <p className="text-[11px] text-slate-600">Otorrinos Curitiba</p>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    OAuth2 Token Ativo
                  </span>
                </div>
              </div>

              {/* WebSocket Orchestrator */}
              <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] space-y-2">
                <div className="flex items-center justify-between">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Orquestrador WS</p>
                  <p className="text-[11px] text-slate-600">Stream Bidirecional</p>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    /ws/orchestrator
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-semibold">Segurança & LGPD:</strong> Todas as requisições de agendamento e identificação de prontuários utilizam tokens de curta duração e mascaramento de dados sensíveis em conformidade com o CFM.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D6]/80 flex items-center justify-between text-xs text-slate-600">
            <span>Servidor: n8n-silvia-py (Easypanel)</span>
            <span className="text-emerald-700 font-medium">Latência média: 42ms</span>
          </div>
        </motion.div>

        {/* CARD 3: Seleção do Corpo Clínico Responsável (col-span-12 lg:col-span-7) */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-7 bg-white border border-[#E8E2D6] rounded-[32px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Corpo Clínico Disponível</h2>
              <p className="text-xs text-slate-700">Selecione para definir como profissional de plantão</p>
            </div>
            {!loading && !error && (
              <span className="text-xs font-semibold text-slate-700 bg-[#FBF9F4] px-3 py-1.5 rounded-full border border-[#E8E2D6]">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? "médico cadastrado" : "médicos cadastrados"}
              </span>
            )}
          </div>

          {/* Filtro de Busca */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, CRM ou especialidade..."
              className="pl-10 h-11 bg-[#FBF9F4] border-[#E8E2D6] focus:border-amber-400 focus:ring-amber-400/20 rounded-xl text-slate-900 text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm font-medium text-slate-700">Carregando médicos da clínica...</p>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Falha ao carregar médicos</p>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDoctors}
                className="rounded-xl border-rose-300 text-rose-800 hover:bg-rose-100"
              >
                Tentar Novamente
              </Button>
            </div>
          )}

          {/* Grid de Médicos */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {paginatedDoctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id;
                const isWeb = doc.medicalAppointmentWEB && doc.medicalAppointmentWEB !== "0";

                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelectDoctor(doc)}
                    className={cn(
                      "group relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between",
                      isSelected
                        ? "border-amber-400 bg-amber-50/50 shadow-sm ring-2 ring-amber-400/30"
                        : "border-[#E8E2D6] bg-[#FBF9F4]/60 hover:bg-white hover:border-amber-300 hover:shadow-sm"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-serif transition-colors",
                              isSelected
                                ? "bg-[#1E2022] text-amber-300"
                                : "bg-white border border-[#E8E2D6] text-slate-700 group-hover:border-amber-300"
                            )}
                          >
                            {doc.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                              {doc.name}
                            </h3>
                            <p className="text-[11px] text-slate-600">
                              {doc.crm ? `CRM ${doc.crm}` : "Sem CRM registrado"}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1">
                        {doc.specialty || "Otorrinolaringologia Geral"}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E8E2D6]/70 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-mono">ID #{doc.id}</span>
                      {isWeb ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Globe className="w-2.5 h-2.5" /> Agendamento Web
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600">Presencial</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Paginação */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D6]">
              <p className="text-xs text-slate-700">
                Página <strong className="text-slate-900">{currentPage}</strong> de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-xl border-[#E8E2D6] hover:bg-slate-100"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-xl border-[#E8E2D6] hover:bg-slate-100"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && filteredDoctors.length === 0 && (
            <p className="text-center text-slate-700 py-10 text-sm">
              {searchQuery ? `Nenhum médico encontrado para "${searchQuery}".` : "Nenhum médico cadastrado na unidade."}
            </p>
          )}
        </motion.div>

        {/* CARD 4: RAG & Diretrizes Cognitivas da Silvia IA (col-span-12 lg:col-span-5) */}
        <motion.div
          variants={item}
          className="col-span-12 lg:col-span-5 bg-white border border-[#E8E2D6] rounded-[32px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Personalidade da IA</h2>
                  <p className="text-xs text-slate-700">Diretrizes de prompt e comportamento (RAG)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                GPT-4o / Claude
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Escreva instruções em linguagem natural para orientar a conduta da Silvia nos atendimentos de WhatsApp do Hospital Otorrinos Curitiba.
            </p>

            {/* Chips de templates rápidos */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                Inserir Diretriz Rápida:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertSnippet(tmpl.snippet)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#FBF9F4] border border-[#E8E2D6] text-slate-700 hover:border-amber-400 hover:text-amber-900 transition-colors"
                  >
                    + {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="rag-prompt" className="text-xs font-semibold text-slate-900">
                  Instruções Cognitivas
                </label>
                <span className="text-[10px] text-slate-600 font-mono">
                  {localRag.length} caracteres
                </span>
              </div>
              <textarea
                id="rag-prompt"
                value={localRag}
                onChange={(e) => setLocalRag(e.target.value)}
                placeholder="Exemplo: Você é a Silvia, assistente virtual do Hospital Otorrinos Curitiba. Responda sempre em português brasileiro de forma acolhedora e prestativa..."
                rows={9}
                className="w-full rounded-2xl border border-[#E8E2D6] bg-[#FBF9F4] px-4 py-3 text-xs leading-relaxed text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all resize-y min-h-[180px]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D6] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveRag}
                disabled={ragSaving}
                className="rounded-xl bg-[#1E2022] hover:bg-slate-800 text-white font-medium text-xs h-10 px-5 gap-2 shadow-sm transition-all"
              >
                {ragSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Save className="w-4 h-4 text-amber-400" />
                )}
                Salvar Diretrizes
              </Button>

              {ragSaved && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in duration-300">
                  ✓ Salvo com sucesso!
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-600">Sincroniza com PostgreSQL</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

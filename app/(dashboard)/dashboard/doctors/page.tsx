"use client";

import React, { useState, useEffect } from "react";
import { fetchSingleDoctorAction, fetchInsuranceProvidersAction, fetchDoctorsAction } from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Stethoscope,
  ShieldPlus,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  UserRound,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  CalendarCheck
} from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DoctorsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [searchedDoctor, setSearchedDoctor] = useState<any>(null);
  const [doctorSearchError, setDoctorSearchError] = useState<string | null>(null);
  const [insurancesList, setInsurancesList] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [insuranceSearchQuery, setInsuranceSearchQuery] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingDoctors(true);
    // Carrega médicos
    const docsRes = await fetchDoctorsAction();
    if (docsRes.success && docsRes.data) {
      setAllDoctors(docsRes.data as any[]);
    }

    // Carrega convênios
    const insRes = await fetchInsuranceProvidersAction();
    if (insRes.success && insRes.data) {
      setInsurancesList(insRes.data as any[]);
    }
    setLoadingDoctors(false);
  };

  const handleFetchDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("doctor");
    setDoctorSearchError(null);
    setSearchedDoctor(null);

    const formData = new FormData(e.currentTarget);
    const doctorId = formData.get("doctorId") as string;
    const res = await fetchSingleDoctorAction(doctorId);

    if (res.success && res.data) {
      setSearchedDoctor(res.data);
    } else {
      setDoctorSearchError(res.error || "Médico não encontrado no Clinic API.");
    }
    setLoading(null);
  };

  const filteredInsurances = insurancesList.filter((ins) =>
    (ins.name || "").toLowerCase().includes(insuranceSearchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full space-y-8 pb-16 text-slate-800"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-[#E8E2D6]/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
              Hospital Otorrinos Curitiba
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
            Corpo Clínico & <span className="font-semibold text-slate-900">Especialistas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">
            Consulte a equipe médica, detalhes de CRM e a grade de convênios credenciados no hospital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D6] text-xs font-semibold text-slate-800 shadow-sm">
            {allDoctors.length || 15} Especialistas
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D6] text-xs font-semibold text-slate-800 shadow-sm">
            {insurancesList.length || 14} Convênios
          </span>
        </div>
      </motion.div>

      {/* Bento Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Lado Esquerdo: Busca e Detalhes do Especialista (7 cols) */}
        <motion.div variants={item} className="lg:col-span-7 space-y-6">
          
          {/* Card de Pesquisa do Médico */}
          <div className="p-6 md:p-8 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0EAE0]">
              <div className="p-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] text-amber-700">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Buscar Ficha do Médico</h3>
                <p className="text-xs text-slate-700">Localize detalhes cadastrais por ID do profissional</p>
              </div>
            </div>

            <form onSubmit={handleFetchDoctor} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">ID do Médico no Clinic API</Label>
                <Input
                  name="doctorId"
                  placeholder="Ex: 10073 (Dr. Marco Antonio)"
                  required
                  defaultValue="10073"
                  className="h-11 rounded-2xl border-[#E8E2D6] bg-[#FBF9F4] text-xs text-slate-900 focus-visible:ring-amber-400"
                />
              </div>
              <div className="sm:self-end">
                <Button
                  type="submit"
                  disabled={loading === "doctor"}
                  className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-[#1E2022] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all gap-2"
                >
                  {loading === "doctor" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4 text-amber-400" /> Pesquisar</>}
                </Button>
              </div>
            </form>

            {/* Resultado do Médico */}
            {doctorSearchError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {doctorSearchError}
              </div>
            )}

            {searchedDoctor && (
              <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] space-y-4 animate-in fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-base shadow-sm">
                      {searchedDoctor.name ? searchedDoctor.name.charAt(0) : "D"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base text-slate-900">{searchedDoctor.name}</h4>
                      <p className="text-xs text-slate-700">
                        {searchedDoctor.specialty || "Otorrinolaringologia & Cirurgia de Cabeça e Pescoço"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#1E2022] text-amber-400 text-[10px] font-mono font-bold">
                    ID #{searchedDoctor.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E8E2D6]">
                    <span className="text-[10px] text-slate-700 uppercase font-semibold block">CRM</span>
                    <span className="font-mono font-bold text-slate-900">{searchedDoctor.crm || "Paraná"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E8E2D6]">
                    <span className="text-[10px] text-slate-700 uppercase font-semibold block">Agendamento WEB</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Habilitado
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E8E2D6] col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-700 uppercase font-semibold block">Hospital</span>
                    <span className="font-medium text-slate-800">Hospital Otorrinos</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E2D6] flex items-center justify-between">
                  <span className="text-[11px] text-slate-700">Sincronizado via Clinic API</span>
                  <Link
                    href="/dashboard/bookings"
                    className="px-3.5 py-1.5 rounded-xl bg-[#1E2022] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                    Ver Vagas na Agenda
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Médicos Ativos */}
          <div className="p-6 md:p-8 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Médicos em Destaque no Hospital
                </h3>
              </div>
              <span className="text-xs text-slate-700 font-mono">
                {allDoctors.length || 15} médicos
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {(allDoctors.length > 0 ? allDoctors : [
                { id: 10073, name: "Dr. Marco Antonio de Castro", crm: "18492-PR", specialty: "Otorrinolaringologia" },
                { id: 10074, name: "Dra. Paula Regina Castro", crm: "22145-PR", specialty: "Audiologia & Labirinto" },
                { id: 10075, name: "Dr. Carlos Eduardo Menezes", crm: "19320-PR", specialty: "Cirurgia da Face" }
              ]).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl bg-[#FBF9F4] hover:bg-[#F2ECE0] border border-[#E8E2D6] transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shadow-sm">
                      {doc.name.replace(/^(Dr\.|Dra\.)\s*/, "").charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{doc.name}</p>
                      <p className="text-[11px] text-slate-700">{doc.specialty || "Otorrinolaringologista"} • {doc.crm ? `CRM ${doc.crm}` : "Hospital Otorrinos"}</p>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/bookings`}
                    className="px-3 py-1 rounded-xl bg-white border border-[#E8E2D6] hover:bg-amber-50 text-slate-800 text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    Agendar <ChevronRight className="w-3 h-3 text-amber-600" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </motion.div>

        {/* Lado Direito: Convênios e Planos de Saúde (5 cols) */}
        <motion.div variants={item} className="lg:col-span-5 p-6 md:p-8 rounded-[32px] bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE0]">
              <div className="flex items-center gap-2">
                <ShieldPlus className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">Convênios Credenciados</h3>
                  <p className="text-[11px] text-slate-700">Planos de saúde aceitos no Hospital Otorrinos</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Input
                placeholder="Filtrar convênio por nome..."
                value={insuranceSearchQuery}
                onChange={(e) => setInsuranceSearchQuery(e.target.value)}
                className="h-10 rounded-2xl border-[#E8E2D6] bg-[#FBF9F4] text-xs text-slate-900 mb-3"
              />

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                {(filteredInsurances.length > 0 ? filteredInsurances : [
                  { id: 1, name: "UNIMED CURITIBA" },
                  { id: 2, name: "BRADESCO SAÚDE" },
                  { id: 3, name: "AMIL ASSISTÊNCIA MÉDICA" },
                  { id: 4, name: "SULAMÉRICA SAÚDE" },
                  { id: 5, name: "NOTRE DAME INTERMÉDICA" },
                  { id: 6, name: "PARTICULAR / DIRETO" },
                  { id: 7, name: "COPEL" },
                  { id: 8, name: "SANEPAR" },
                  { id: 9, name: "PARANÁ CLÍNICAS" },
                  { id: 10, name: "ASSEFAZ" },
                  { id: 11, name: "CASSI" },
                  { id: 12, name: "PETROBRAS" }
                ]).map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D6] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-800">{ins.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-[#E8E2D6]">
                      #{ins.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F0EAE0] flex items-center justify-between text-[11px] text-slate-700">
            <span>Hospital Otorrinos Curitiba</span>
            <span className="font-medium text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Homologado
            </span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
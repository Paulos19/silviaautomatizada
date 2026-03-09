"use client";

import { useState, useEffect } from "react";
import { checkPatientExistsAction, createPatientAction, fetchInsuranceProvidersAction } from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Search,
  Check,
  AlertCircle,
  UserRound,
  Phone,
  Mail,
  Hash,
  CalendarDays,
  Sparkles,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

// ─── Animations ───
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Helpers ───
function maskDateBR(value: string): string {
  let v = value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
}

function parseDateBRToISO(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

function maskCPF(value: string): string {
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
  if (v.length > 6) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
  if (v.length > 3) return `${v.slice(0, 3)}.${v.slice(3)}`;
  return v;
}

function maskPhone(value: string): string {
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 6) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  if (v.length > 2) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  return v;
}

// ─── Interfaces ───
interface InsuranceOption {
  id: number;
  name?: string | null;
}

interface PatientExistsResult {
  success: boolean;
  data?: {
    patient_id?: number | null;
    patient_name?: string | null;
    patient_mobile?: string | null;
    patient_email?: string | null;
  };
  error?: string;
}

interface CreatePatientResult {
  success: boolean;
  data?: any;
  error?: string;
}

// ─── Styled Input ───
function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: React.ReactNode }) {
  const { label, icon, className, ...rest } = props;
  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</Label>}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">{icon}</div>}
        <Input
          {...rest}
          className={cn(
            "h-11 rounded-2xl border border-white/10 bg-[#0B121D]/60 text-slate-200 placeholder:text-slate-600",
            "focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500/40 transition-all",
            icon && "pl-10",
            className
          )}
        />
      </div>
    </div>
  );
}

// ─── Styled Select ───
function StyledSelect({ value, onChange, children, name, required, className }: {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  name?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={cn(
        "w-full h-11 rounded-2xl border border-white/10 bg-[#0B121D]/60 px-4 text-sm text-slate-200",
        "focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40 transition-all",
        "appearance-none cursor-pointer",
        className
      )}
    >
      {children}
    </select>
  );
}

// ─── Patient Info Card (for results) ───
function PatientInfoCard({ data, type }: { data: any; type: "found" | "created" }) {
  const isFound = type === "found";
  const accent = isFound ? "emerald" : "teal";

  // Determine what data to show
  const name = data?.patient_name || data?.data?.patient_name || data?.data?.result?.name || data?.result?.name || null;
  const id = data?.patient_id || data?.data?.patient_id || data?.data?.result?.id || data?.result?.id || null;
  const mobile = data?.patient_mobile || data?.data?.patient_mobile || data?.data?.result?.mobile || data?.result?.mobile || null;
  const email = data?.patient_email || data?.data?.patient_email || data?.data?.result?.email || data?.result?.email || null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-5 rounded-2xl border space-y-4 relative overflow-hidden",
        isFound ? "bg-emerald-500/5 border-emerald-500/20" : "bg-teal-500/5 border-teal-500/20"
      )}
    >
      {/* Glow */}
      <div className={cn(
        "absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full blur-3xl",
        isFound ? "bg-emerald-500/10" : "bg-teal-500/10"
      )} />

      {/* Header */}
      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center border",
          isFound ? "bg-emerald-500/10 border-emerald-500/20" : "bg-teal-500/10 border-teal-500/20"
        )}>
          {isFound
            ? <UserCheck className="w-5 h-5 text-emerald-400" />
            : <Check className="w-5 h-5 text-teal-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-bold", isFound ? "text-emerald-400" : "text-teal-400")}>
            {isFound ? "Paciente Encontrado" : "Paciente Salvo"}
          </p>
          {name && <p className="text-base font-outfit font-semibold text-white truncate mt-0.5">{name}</p>}
        </div>
      </div>

      {/* Details Grid */}
      {(id || mobile || email) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
          {id && (
            <div className="flex items-center gap-2 bg-[#0B121D]/40 rounded-xl px-3 py-2.5 border border-white/5">
              <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-bold">ID</p>
                <p className="text-sm text-white font-mono">{id}</p>
              </div>
            </div>
          )}
          {mobile && (
            <div className="flex items-center gap-2 bg-[#0B121D]/40 rounded-xl px-3 py-2.5 border border-white/5">
              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-bold">Celular</p>
                <p className="text-sm text-white font-mono">{mobile}</p>
              </div>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 bg-[#0B121D]/40 rounded-xl px-3 py-2.5 border border-white/5">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-600 uppercase font-bold">Email</p>
                <p className="text-sm text-white truncate">{email}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback: Show raw data if nothing structured was found */}
      {!name && !id && (
        <div className="bg-[#0B121D]/40 rounded-xl p-3 border border-white/5 relative z-10">
          <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Resposta da API</p>
          <pre className="text-xs text-slate-400 overflow-auto max-h-32 font-mono whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </motion.div>
  );
}

export default function PatientsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [existsResult, setExistsResult] = useState<PatientExistsResult | null>(null);
  const [createResult, setCreateResult] = useState<CreatePatientResult | null>(null);
  const [insurances, setInsurances] = useState<InsuranceOption[]>([]);
  const [loadingInsurances, setLoadingInsurances] = useState(true);

  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    setLoadingInsurances(true);
    const res = await fetchInsuranceProvidersAction();
    if (res.success && res.data) {
      setInsurances(res.data as InsuranceOption[]);
    }
    setLoadingInsurances(false);
  };

  const handleCheckExists = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("exists");
    setExistsResult(null);
    const formData = new FormData(e.currentTarget);
    const nin = (formData.get("nin") as string).replace(/\D/g, "");
    const birthdayRaw = formData.get("birthday") as string;
    const birthday = parseDateBRToISO(birthdayRaw);
    const res = await checkPatientExistsAction(nin, birthday);
    setExistsResult(res as PatientExistsResult);
    setLoading(null);
  };

  const handleCreatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("createPatient");
    setCreateResult(null);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      nin: (formData.get("nin") as string).replace(/\D/g, ""),
      birthday: parseDateBRToISO(formData.get("birthday") as string),
      mobile: (formData.get("mobile") as string || "").replace(/\D/g, ""),
      email: formData.get("email") || "",
      sex: "M", maritalStatus: 3,
      healthInsuranceCode: Number(formData.get("healthInsuranceCode")),
      external_id: ""
    };
    const res = await createPatientAction(payload);
    setCreateResult(res as CreatePatientResult);
    setLoading(null);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-8 text-slate-200">

      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-outfit font-semibold text-white tracking-tight">Gestão de Pacientes</h1>
        <p className="text-sm font-inter text-slate-400 mt-2">Verifique cadastros existentes ou registre novos pacientes no sistema.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ═══ Card 1: Verificar Cadastro ═══ */}
        <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-8 flex flex-col group hover:border-emerald-500/20 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-outfit text-base font-medium text-white">Verificar Cadastro</h3>
              <p className="text-xs text-slate-500 font-inter">Consulte se o paciente possui prontuário ativo</p>
            </div>
          </div>

          <form onSubmit={handleCheckExists} className="space-y-4">
            <StyledInput
              name="nin"
              label="CPF"
              placeholder="000.000.000-00"
              icon={<Hash className="w-4 h-4" />}
              maxLength={14}
              onChange={(e) => { e.target.value = maskCPF(e.target.value); }}
              required
            />
            <StyledInput
              name="birthday"
              label="Data de Nascimento"
              placeholder="DD/MM/AAAA"
              icon={<CalendarDays className="w-4 h-4" />}
              maxLength={10}
              onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
              required
            />
            <Button
              type="submit"
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110 transition-all gap-2"
              disabled={loading === "exists"}
            >
              {loading === "exists" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4" /> Consultar Base</>}
            </Button>
          </form>

          {/* ── Results ── */}
          {existsResult && (
            <div className="mt-5">
              {existsResult.success && existsResult.data ? (
                <PatientInfoCard data={existsResult.data} type="found" />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20"
                >
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">Paciente não encontrado</p>
                    <p className="text-xs text-slate-500 mt-0.5">Verifique o CPF e data de nascimento ou cadastre um novo prontuário.</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* ═══ Card 2: Novo Prontuário ═══ */}
        <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-8 flex flex-col group hover:border-blue-500/20 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-outfit text-base font-medium text-white">Novo Prontuário</h3>
              <p className="text-xs text-slate-500 font-inter">Cadastre ou atualize os dados do paciente</p>
            </div>
          </div>

          <form onSubmit={handleCreatePatient} className="space-y-4 flex-1 flex flex-col">
            <StyledInput
              name="name"
              label="Nome Completo"
              placeholder="Nome do paciente"
              icon={<UserRound className="w-4 h-4" />}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <StyledInput
                name="nin"
                label="CPF"
                placeholder="000.000.000-00"
                icon={<Hash className="w-4 h-4" />}
                maxLength={14}
                onChange={(e) => { e.target.value = maskCPF(e.target.value); }}
                required
              />
              <StyledInput
                name="birthday"
                label="Data Nasc."
                placeholder="DD/MM/AAAA"
                icon={<CalendarDays className="w-4 h-4" />}
                maxLength={10}
                onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StyledInput
                name="mobile"
                label="Celular"
                placeholder="(00) 00000-0000"
                icon={<Phone className="w-4 h-4" />}
                maxLength={15}
                onChange={(e) => { e.target.value = maskPhone(e.target.value); }}
              />
              <StyledInput
                name="email"
                label="Email"
                placeholder="email@exemplo.com"
                icon={<Mail className="w-4 h-4" />}
                type="email"
              />
            </div>

            {/* Convênio */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Convênio
              </Label>
              {loadingInsurances ? (
                <div className="flex items-center gap-2 h-11 px-4 text-sm text-slate-500 bg-[#0B121D]/60 border border-white/10 rounded-2xl">
                  <Loader2 className="animate-spin w-4 h-4 text-blue-400" /> Carregando convênios...
                </div>
              ) : (
                <StyledSelect name="healthInsuranceCode" required>
                  <option value="">Selecione um convênio...</option>
                  {insurances.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name || `Convênio #${ins.id}`}
                    </option>
                  ))}
                </StyledSelect>
              )}
            </div>

            <div className="flex-1" />

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:brightness-110 transition-all gap-2 text-base mt-2"
              disabled={loading === "createPatient"}
            >
              {loading === "createPatient" ? <Loader2 className="animate-spin w-5 h-5" /> : <><Sparkles className="w-5 h-5" /> Salvar Paciente</>}
            </Button>
          </form>

          {/* ── Results ── */}
          {createResult && (
            <div className="mt-5">
              {createResult.success ? (
                <PatientInfoCard data={createResult} type="created" />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-rose-400">Erro ao salvar paciente</p>
                    <p className="text-xs text-slate-500 mt-0.5">{createResult.error || "Tente novamente."}</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
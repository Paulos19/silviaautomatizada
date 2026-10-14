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
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

// ─── Animations ───
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
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
    <div className="space-y-1.5">
      {label && <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</Label>}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
        <Input
          {...rest}
          className={cn(
            "h-11 rounded-2xl border border-[#E8E2D6] bg-white text-slate-900 placeholder:text-slate-400 shadow-sm",
            "focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:border-amber-400 transition-all text-xs",
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
        "w-full h-11 rounded-2xl border border-[#E8E2D6] bg-white px-4 text-xs text-slate-900 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all",
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

  const name = data?.patient_name || data?.data?.patient_name || data?.data?.result?.name || data?.result?.name || null;
  const id = data?.patient_id || data?.data?.patient_id || data?.data?.result?.id || data?.result?.id || null;
  const mobile = data?.patient_mobile || data?.data?.patient_mobile || data?.data?.result?.mobile || data?.result?.mobile || null;
  const email = data?.patient_email || data?.data?.patient_email || data?.data?.result?.email || data?.result?.email || null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-5 rounded-2xl border space-y-3.5 relative overflow-hidden",
        isFound ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm",
          isFound ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-amber-100 border-amber-300 text-amber-800"
        )}>
          {isFound
            ? <UserCheck className="w-5 h-5" />
            : <Check className="w-5 h-5" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-bold uppercase tracking-wider", isFound ? "text-emerald-800" : "text-amber-800")}>
            {isFound ? "Paciente Localizado" : "Prontuário Registrado com Sucesso"}
          </p>
          {name && <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{name}</p>}
        </div>
      </div>

      {/* Details Grid */}
      {(id || mobile || email) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative z-10">
          {id && (
            <div className="flex items-center gap-2 bg-white/90 rounded-xl px-3 py-2 border border-[#E8E2D6] shadow-sm">
              <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-700 uppercase font-bold">ID Clinic</p>
                <p className="text-xs text-slate-900 font-mono font-semibold">#{id}</p>
              </div>
            </div>
          )}
          {mobile && (
            <div className="flex items-center gap-2 bg-white/90 rounded-xl px-3 py-2 border border-[#E8E2D6] shadow-sm">
              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-700 uppercase font-bold">Celular</p>
                <p className="text-xs text-slate-900 font-mono font-semibold">{mobile}</p>
              </div>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 bg-white/90 rounded-xl px-3 py-2 border border-[#E8E2D6] shadow-sm">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-700 uppercase font-bold">Email</p>
                <p className="text-xs text-slate-900 font-semibold truncate max-w-[130px]">{email}</p>
              </div>
            </div>
          )}
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
    <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-8 text-slate-800 pb-16">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-[#E8E2D6]/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
              Hospital Otorrinos Curitiba
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
            Gestão de <span className="font-semibold text-slate-900">Pacientes & Prontuários</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">Consulte prontuários existentes ou cadastre novos pacientes diretamente no Clinic API.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ═══ Card 1: Verificar Cadastro (5 cols) ═══ */}
        <motion.div variants={item} className="lg:col-span-5 bg-white border border-[#E8E2D6] rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F0EAE0]">
              <div className="p-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] text-amber-700">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Verificar Cadastro</h3>
                <p className="text-xs text-slate-700">Localize prontuário por CPF e data de nascimento</p>
              </div>
            </div>

            <form onSubmit={handleCheckExists} className="space-y-4">
              <StyledInput
                name="nin"
                label="CPF do Paciente"
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
                className="w-full h-11 rounded-2xl bg-[#1E2022] hover:bg-black text-white font-semibold shadow-sm transition-all gap-2 text-xs"
                disabled={loading === "exists"}
              >
                {loading === "exists" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4 text-amber-400" /> Consultar Base do Clinic API</>}
              </Button>
            </form>

            {/* Results */}
            {existsResult && (
              <div className="mt-5">
                {existsResult.success && existsResult.data ? (
                  <PatientInfoCard data={existsResult.data} type="found" />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900">Paciente não encontrado</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">Verifique os dados ou realize o cadastro no painel ao lado.</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 mt-6 border-t border-[#F0EAE0] text-[11px] text-slate-700 flex items-center justify-between">
            <span>Integração Clinic API</span>
            <span className="font-semibold text-emerald-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Sincronizado
            </span>
          </div>
        </motion.div>

        {/* ═══ Card 2: Novo Prontuário (7 cols) ═══ */}
        <motion.div variants={item} className="lg:col-span-7 bg-white border border-[#E8E2D6] rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F0EAE0]">
              <div className="p-2.5 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-800">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Novo Prontuário</h3>
                <p className="text-xs text-slate-700">Registre novos pacientes no banco do hospital</p>
              </div>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <StyledInput
                name="name"
                label="Nome Completo"
                placeholder="Ex: Maria Luiza da Silva"
                icon={<UserRound className="w-4 h-4" />}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StyledInput
                  name="mobile"
                  label="Celular / WhatsApp"
                  placeholder="(41) 90000-0000"
                  icon={<Phone className="w-4 h-4" />}
                  maxLength={15}
                  onChange={(e) => { e.target.value = maskPhone(e.target.value); }}
                />
                <StyledInput
                  name="email"
                  label="E-mail"
                  placeholder="paciente@exemplo.com"
                  icon={<Mail className="w-4 h-4" />}
                  type="email"
                />
              </div>

              {/* Convênio */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Convênio Principal
                </Label>
                {loadingInsurances ? (
                  <div className="flex items-center gap-2 h-11 px-4 text-xs text-slate-700 bg-[#FBF9F4] border border-[#E8E2D6] rounded-2xl">
                    <Loader2 className="animate-spin w-4 h-4 text-amber-600" /> Carregando lista de convênios...
                  </div>
                ) : (
                  <StyledSelect name="healthInsuranceCode" required>
                    <option value="">Selecione um plano de saúde...</option>
                    {insurances.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name || `Convênio #${ins.id}`}
                      </option>
                    ))}
                  </StyledSelect>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-2xl bg-[#1E2022] hover:bg-black text-white font-semibold shadow-sm transition-all gap-2 text-xs"
                  disabled={loading === "createPatient"}
                >
                  {loading === "createPatient" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Sparkles className="w-4 h-4 text-amber-400" /> Criar Prontuário no Clinic API</>}
                </Button>
              </div>
            </form>

            {/* Results */}
            {createResult && (
              <div className="mt-5">
                {createResult.success ? (
                  <PatientInfoCard data={createResult} type="created" />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-rose-800">Falha ao salvar prontuário</p>
                      <p className="text-[11px] text-rose-700 mt-0.5">{createResult.error || "Tente novamente."}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 mt-6 border-t border-[#F0EAE0] text-[11px] text-slate-700 flex items-center justify-between">
            <span>Hospital Otorrinos Curitiba</span>
            <span className="text-slate-700">Cadastro Seguro</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
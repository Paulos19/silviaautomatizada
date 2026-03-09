"use client";

import { useState, useEffect } from "react";
import { useClinicSettings } from "@/components/dashboard/clinic-settings-context";
import {
  fetchFreeSlotsAction,
  bookSlotAction,
  cancelBookingAction,
  fetchInsuranceProvidersAction,
  checkPatientExistsAction,
  fetchPatientBookingsAction,
  fetchBookingsByNINAction,
  fetchBookingByIdAction,
} from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CalendarSearch,
  CalendarCheck,
  CalendarX,
  Clock,
  AlertCircle,
  Check,
  Stethoscope,
  Search,
  ChevronRight,
  CalendarDays,
  UserRound,
  ShieldCheck,
  Sparkles,
  Ban,
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

// ─── Helpers de formatação ───
function formatSlotLabel(iso: string): { day: string; time: string; full: string } {
  const date = new Date(iso);
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const dayOfWeek = dayNames[date.getDay()];
  const dayNum = date.getDate();
  const month = monthNames[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return {
    day: `${dayOfWeek}, ${dayNum} ${month}`,
    time: `${hours}:${minutes}`,
    full: `${dayOfWeek}, ${dayNum} ${month} — ${hours}:${minutes}`,
  };
}

function groupSlotsByDate(slots: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const iso of slots) {
    const date = new Date(iso);
    const key = date.toISOString().split("T")[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(iso);
  }
  return groups;
}

function formatDateLabel(dateKey: string): string {
  const date = new Date(dateKey + "T12:00:00");
  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${dayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}`;
}

function maskDateBR(value: string): string {
  let v = value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length >= 5) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  } else if (v.length >= 3) {
    return `${v.slice(0, 2)}/${v.slice(2)}`;
  }
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

// ─── Interfaces ───
interface InsuranceOption {
  id: number;
  name?: string | null;
}

interface PatientResult {
  patient_id?: number | null;
  patient_name?: string | null;
  patient_mobile?: string | null;
  patient_email?: string | null;
}

interface BookingItem {
  id: number;
  status?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  typeDescription?: string | null;
  insurance?: { name?: string | null } | null;
}

interface PendingBooking {
  id: number;
  date?: string | null;
  hour?: string | null;
  doctor_name?: string | null;
  doctor_id?: number | null;
  address_id?: number | string | null;
  sector?: string | null;
  service?: string | null;
  status?: string | null;
  confirm?: string | null;
  insurance?: string | null;
}

// ─── Styled Select ───
function StyledSelect({ value, onChange, children, className }: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
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

// ─── Styled Input ───
function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className, ...rest } = props;
  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</Label>}
      <Input
        {...rest}
        className={cn(
          "h-11 rounded-2xl border border-white/10 bg-[#0B121D]/60 text-slate-200 placeholder:text-slate-600",
          "focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500/40 transition-all",
          className
        )}
      />
    </div>
  );
}

export default function BookingsPage() {
  const { selectedDoctor, addressId } = useClinicSettings();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [freeSlots, setFreeSlots] = useState<string[]>([]);

  // Nova consulta state
  const [insurances, setInsurances] = useState<InsuranceOption[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<number | null>(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<number | null>(null);
  const [patientResult, setPatientResult] = useState<PatientResult | null>(null);
  const [patientSearchError, setPatientSearchError] = useState<string | null>(null);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [bookResult, setBookResult] = useState<any>(null);

  // Cancelamento state
  const [cancelPatient, setCancelPatient] = useState<PatientResult | null>(null);
  const [cancelSearchError, setCancelSearchError] = useState<string | null>(null);
  const [patientBookings, setPatientBookings] = useState<BookingItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [cancelResult, setCancelResult] = useState<any>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"new" | "cancel">("new");

  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    const res = await fetchInsuranceProvidersAction();
    if (res.success && res.data) {
      setInsurances(res.data as InsuranceOption[]);
    }
  };

  // ─── Buscar Slots ───
  const handleGetSlots = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setLoading("slots");
    setFreeSlots([]);
    setSelectedSlot(null);
    const formData = new FormData(e.currentTarget);
    const startDate = parseDateBRToISO(formData.get("startDate") as string);
    const endDate = parseDateBRToISO(formData.get("endDate") as string);
    const res = await fetchFreeSlotsAction(
      selectedDoctor.id.toString(),
      addressId,
      startDate,
      endDate
    );
    if (res.success && Array.isArray(res.data)) {
      setFreeSlots(res.data);
    }
    setLoading(null);
  };

  // ─── Buscar Paciente (Nova Consulta) ───
  const handleSearchPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("patientSearch");
    setPatientResult(null);
    setPatientSearchError(null);
    setPendingBookings([]);
    const formData = new FormData(e.currentTarget);
    const nin = formData.get("nin") as string;
    const birthdayStr = formData.get("birthday") as string;
    const birthday = parseDateBRToISO(birthdayStr);
    const res = await checkPatientExistsAction(nin, birthday);
    if (res.success && res.data) {
      const patient = res.data as PatientResult;
      setPatientResult(patient);

      const bookingRes = await fetchBookingsByNINAction(nin, birthday);
      if (bookingRes.success && bookingRes.data) {
        const found = bookingRes.data as any;
        const bDoctorId = found.doctorId?.toString() || found.doctor_id?.toString() || "";
        const bAddressId = found.addressId?.toString() || found.address_id?.toString() || addressId;
        const bBookingId = found.id?.toString() || "";

        if (bBookingId) {
          const detailRes = await fetchBookingByIdAction(bDoctorId, bAddressId, bBookingId);
          if (detailRes.success && detailRes.data) {
            const detail = detailRes.data as any;
            setPendingBookings([{
              id: detail.id,
              date: detail.start_at ? new Date(detail.start_at).toLocaleDateString("pt-BR") : (found.date_schedule || found.date),
              hour: detail.start_at
                ? new Date(detail.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                : (found.hour_schedule || found.hour || "").split(':').slice(0, 2).join(':'),
              doctor_name: detail.doctor_name || found.doctor || found.doctor_name,
              sector: detail.address_service?.name || found.sector,
              service: detail.address_service?.name,
              status: detail.status || found.status,
              confirm: detail.confirm || found.confirm,
              insurance: detail.insurance?.name || found.healthInsurance
            }]);
          } else {
            setPendingBookings([{
              id: found.id,
              date: found.date_schedule || found.date,
              hour: (found.hour_schedule || found.hour || "").split(':').slice(0, 2).join(':'),
              doctor_name: found.doctor || found.doctor_name,
              sector: found.sector,
              service: null,
              status: found.status,
              confirm: found.confirm,
              insurance: found.healthInsurance
            }]);
          }
        }
      }
    } else {
      setPatientSearchError("Paciente não encontrado. Verifique CPF e data de nascimento.");
    }
    setLoading(null);
  };

  // ─── Agendar ───
  const handleBookSlot = async () => {
    if (!selectedDoctor || !selectedSlot || !patientResult?.patient_id || !selectedInsurance || selectedAppointmentType === null) return;
    setLoading("book");
    const payload = {
      patient_id: patientResult.patient_id,
      healthInsuranceCode: selectedInsurance,
      obs: "Agendado via Dashboard",
      appointmentType: selectedAppointmentType,
      external_id: "",
      address_service_id: 1,
      consultationType: 1,
    };
    const res = await bookSlotAction(
      selectedDoctor.id.toString(),
      addressId,
      selectedSlot,
      payload
    );
    setBookResult(res);
    setLoading(null);
  };

  // ─── Buscar Paciente (Cancelar) ───
  const handleSearchCancelPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("cancelSearch");
    setCancelPatient(null);
    setCancelSearchError(null);
    setPatientBookings([]);
    setPendingBookings([]);
    setSelectedBooking(null);
    setCancelResult(null);
    const formData = new FormData(e.currentTarget);
    const nin = formData.get("nin") as string;
    const birthdayStr = formData.get("birthday") as string;
    const birthday = parseDateBRToISO(birthdayStr);
    const res = await checkPatientExistsAction(nin, birthday);
    if (res.success && res.data && (res.data as PatientResult).patient_id) {
      const patient = res.data as PatientResult;
      setCancelPatient(patient);
      let foundItems: any[] = [];
      if (selectedDoctor) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const startStr = now.toISOString().split("T")[0];
        const endStr = futureDate.toISOString().split("T")[0];
        const bookingsRes = await fetchPatientBookingsAction(
          selectedDoctor.id.toString(),
          addressId,
          patient.patient_id!.toString(),
          startStr,
          endStr
        );
        if (bookingsRes.success && bookingsRes.data) {
          const bookingsData = bookingsRes.data as any;
          foundItems = bookingsData?.result?.items || [];
          setPatientBookings(foundItems);
        }
      }

      const bookingRes = await fetchBookingsByNINAction(nin, birthday);
      const allFoundRaw: any[] = [];
      if (bookingRes.success && bookingRes.data) allFoundRaw.push(bookingRes.data);
      foundItems.forEach(item => {
        if (!allFoundRaw.some(f => f.id === item.id)) allFoundRaw.push(item);
      });

      const detailedList: PendingBooking[] = [];
      for (const found of allFoundRaw) {
        const bDoctorId = found.doctorId?.toString() || found.doctor_id?.toString() || selectedDoctor?.id?.toString() || "";
        const bAddressId = found.addressId?.toString() || found.address_id?.toString() || addressId;
        const bBookingId = found.id?.toString() || "";

        if (bBookingId) {
          const detailRes = await fetchBookingByIdAction(bDoctorId, bAddressId, bBookingId);
          if (detailRes.success && detailRes.data) {
            const detail = detailRes.data as any;
            detailedList.push({
              id: detail.id,
              date: detail.start_at ? new Date(detail.start_at).toLocaleDateString("pt-BR") : (found.date_schedule || found.date),
              hour: detail.start_at
                ? new Date(detail.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                : (found.hour_schedule || found.hour || "").split(':').slice(0, 2).join(':'),
              doctor_name: detail.doctor_name || found.doctor || found.doctor_name,
              sector: (detail.address_service?.name as string) || (found.sector as string),
              service: (detail.address_service?.name as string),
              status: detail.status || found.status,
              confirm: detail.confirm || found.confirm,
              insurance: detail.insurance?.name || found.healthInsurance
            });
          } else {
            detailedList.push({
              id: found.id,
              date: found.date_schedule || found.date,
              hour: (found.hour_schedule || found.hour || "").split(':').slice(0, 2).join(':'),
              doctor_name: found.doctor || found.doctor_name,
              sector: found.sector,
              service: null,
              status: found.status,
              confirm: found.confirm,
              insurance: found.healthInsurance
            });
          }
        }
      }
      setPendingBookings(detailedList);
      if (detailedList.length > 0) setSelectedBooking(detailedList[0].id);
    } else {
      setCancelSearchError("Paciente não encontrado. Verifique CPF e data de nascimento.");
    }
    setLoading(null);
  };

  // ─── Cancelar Agendamento ───
  const handleCancelBooking = async () => {
    if (!selectedDoctor || !selectedBooking) return;
    setLoading("cancel");
    const res = await cancelBookingAction(
      selectedDoctor.id.toString(),
      addressId,
      selectedBooking.toString()
    );
    setCancelResult(res);
    setLoading(null);
  };

  // ─── Guard: Médico não configurado ───
  if (!selectedDoctor) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-8 text-slate-200">
        <motion.div variants={item}>
          <h1 className="text-3xl font-outfit font-semibold text-white tracking-tight">Agendamentos</h1>
          <p className="text-sm font-inter text-slate-400 mt-2">Gerencie horários, marque consultas e processe cancelamentos.</p>
        </motion.div>
        <motion.div variants={item} className="bg-[#111A28]/80 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-10 flex flex-col items-center justify-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-violet-400" />
          </div>
          <div className="text-center">
            <h3 className="font-outfit font-semibold text-lg text-white">Médico não configurado</h3>
            <p className="text-sm text-slate-400 mt-1 font-inter">
              Acesse <strong className="text-violet-400">Configurações</strong> para selecionar o médico responsável.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/dashboard/settings"}
            className="bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-violet-500/20 rounded-2xl px-6"
          >
            Ir para Configurações
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const groupedSlots = groupSlotsByDate(freeSlots);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-8 text-slate-200">

      {/* ═══ HEADER ═══ */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-semibold text-white tracking-tight">Agendamentos</h1>
          <p className="text-sm font-inter text-slate-400 mt-2">
            Horários de <span className="text-teal-400 font-medium">{selectedDoctor.name}</span>
            {selectedDoctor.crm && <span className="text-slate-500"> · CRM {selectedDoctor.crm}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#111A28]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab("new")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-inter font-medium transition-all duration-300",
              activeTab === "new"
                ? "bg-teal-500/15 text-teal-400 border border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            )}
          >
            <CalendarCheck className="w-4 h-4 inline mr-2" />Nova Consulta
          </button>
          <button
            onClick={() => setActiveTab("cancel")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-inter font-medium transition-all duration-300",
              activeTab === "cancel"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            )}
          >
            <CalendarX className="w-4 h-4 inline mr-2" />Cancelar
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ═══ LEFT PANEL: Slots Livres ═══ */}
        <motion.div variants={item} className="lg:col-span-2 bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-8 flex flex-col group hover:border-teal-500/20 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20">
              <CalendarSearch className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-outfit text-base font-medium text-white">Slots Livres</h3>
              <p className="text-xs text-slate-500 font-inter">Busque horários disponíveis</p>
            </div>
          </div>

          <form onSubmit={handleGetSlots} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StyledInput
                name="startDate"
                label="Data Início"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                required
              />
              <StyledInput
                name="endDate"
                label="Data Fim"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:brightness-110 transition-all gap-2"
              disabled={loading === "slots"}
            >
              {loading === "slots" ? <Loader2 className="animate-spin w-4 h-4" /> : <><CalendarSearch className="w-4 h-4" /> Buscar Agenda</>}
            </Button>
          </form>

          {/* Slots Results */}
          {freeSlots.length > 0 ? (
            <div className="space-y-4 mt-6 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar flex-1">
              {Object.entries(groupedSlots).map(([dateKey, slots]) => (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
                    <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                      {formatDateLabel(dateKey)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((iso) => {
                      const { time } = formatSlotLabel(iso);
                      const isActive = selectedSlot === iso;
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => setSelectedSlot(iso)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                            "border active:scale-95",
                            isActive
                              ? "bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/20"
                              : "bg-[#0B121D]/60 text-slate-400 border-white/5 hover:border-teal-500/30 hover:text-teal-400 hover:bg-teal-500/5"
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {time}
                          {isActive && <Check className="w-3 h-3 ml-0.5 text-teal-400" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <CalendarSearch className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-center text-sm text-slate-600 font-inter">
                Busque um período para ver os<br />horários disponíveis.
              </p>
            </div>
          )}
        </motion.div>

        {/* ═══ RIGHT PANEL: Action Area ═══ */}
        <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-6">

          {/* ── TAB: NOVA CONSULTA ── */}
          {activeTab === "new" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111A28]/80 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 md:p-8 flex flex-col group hover:border-teal-500/20 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                  <CalendarCheck className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-outfit text-base font-medium text-white">Nova Consulta</h3>
                  <p className="text-xs text-slate-500 font-inter">
                    {selectedSlot
                      ? formatSlotLabel(selectedSlot).full
                      : "Selecione um slot livre ao lado para começar"}
                  </p>
                </div>
              </div>

              {/* Selected Slot Badge */}
              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-3 mt-4 rounded-2xl bg-teal-500/5 border border-teal-500/20"
                >
                  <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-sm font-medium text-teal-300">{formatSlotLabel(selectedSlot).full}</span>
                </motion.div>
              )}

              {/* Etapa 1: Identificar Paciente */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold font-outfit">1</span>
                  <h4 className="text-sm font-semibold font-inter text-slate-300">Identificar Paciente</h4>
                </div>
                <form onSubmit={handleSearchPatient} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <StyledInput name="nin" label="CPF" placeholder="Apenas números" required />
                    <StyledInput
                      name="birthday"
                      label="Data de Nascimento"
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-11 rounded-2xl bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-teal-500/30 gap-2 transition-all"
                    disabled={loading === "patientSearch"}
                  >
                    {loading === "patientSearch" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4" /> Buscar Paciente</>}
                  </Button>
                </form>

                {/* Patient Found */}
                {patientResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <UserRound className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{patientResult.patient_name || "Paciente"}</p>
                      <p className="text-xs text-slate-500 font-mono">ID {patientResult.patient_id}</p>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  </motion.div>
                )}

                {/* Pending Booking Warning */}
                {pendingBookings.length > 0 && activeTab === "new" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Agendamento existente</p>
                    </div>
                    {(() => {
                      const pb = pendingBookings[0];
                      return (
                        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl" />
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <div className="flex items-center gap-2 text-amber-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-xl font-bold font-outfit">{pb.hour}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{pb.date}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold uppercase">
                                {pb.sector || 'CLINIC'}
                              </span>
                              {pb.status && (
                                <span className="text-[9px] bg-white/5 border border-amber-500/10 text-amber-400/80 px-2 py-0.5 rounded-full font-bold uppercase">
                                  {pb.status}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-px bg-amber-500/10 w-full" />
                          <div className="space-y-2 relative z-10">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-amber-400" />
                              <span className="text-sm font-semibold text-white">{pb.doctor_name}</span>
                            </div>
                            {pb.insurance && (
                              <div className="flex items-center gap-2 pl-6">
                                <ShieldCheck className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-400">{pb.insurance}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* Error */}
                {patientSearchError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <p className="text-sm text-rose-400">{patientSearchError}</p>
                  </motion.div>
                )}
              </div>

              {/* Etapa 2: Convênio */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold font-outfit">2</span>
                  <h4 className="text-sm font-semibold font-inter text-slate-300">Convênio</h4>
                </div>
                <StyledSelect
                  value={selectedInsurance ?? ""}
                  onChange={(e) => setSelectedInsurance(Number(e.target.value) || null)}
                >
                  <option value="">Selecione um convênio...</option>
                  {insurances.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name || `Convênio #${ins.id}`}
                    </option>
                  ))}
                </StyledSelect>
              </div>

              {/* Etapa 3: Tipo */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold font-outfit">3</span>
                  <h4 className="text-sm font-semibold font-inter text-slate-300">Tipo de Consulta</h4>
                </div>
                <StyledSelect
                  value={selectedAppointmentType ?? ""}
                  onChange={(e) => setSelectedAppointmentType(e.target.value !== "" ? Number(e.target.value) : null)}
                >
                  <option value="">Selecione um tipo...</option>
                  <option value={0}>1ª Consulta</option>
                  <option value={1}>Consulta</option>
                  <option value={2}>Exame</option>
                  <option value={3}>Retorno</option>
                  <option value={4}>Cirurgia</option>
                  <option value={5}>AgendaWEB</option>
                  <option value={6}>Bloqueio Automático</option>
                  <option value={9}>(B)loqueado</option>
                </StyledSelect>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleBookSlot}
                className="w-full h-12 mt-8 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:brightness-110 transition-all gap-2 text-base"
                disabled={!selectedSlot || !patientResult?.patient_id || !selectedInsurance || selectedAppointmentType === null || loading === "book"}
              >
                {loading === "book" ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <><Sparkles className="w-5 h-5" /> Confirmar Marcação</>
                )}
              </Button>

              {bookResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-2xl text-sm mt-4",
                    bookResult.success
                      ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/5 border border-rose-500/20 text-rose-400"
                  )}
                >
                  {bookResult.success ? (
                    <p className="font-medium flex items-center gap-2"><Check className="w-4 h-4" /> Consulta agendada com sucesso!</p>
                  ) : (
                    <p className="font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {bookResult.error}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── TAB: CANCELAR / DESMARCAR ── */}
          {activeTab === "cancel" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111A28]/80 backdrop-blur-xl border border-rose-500/10 rounded-3xl p-6 md:p-8 flex flex-col group hover:border-rose-500/20 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <CalendarX className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-outfit text-base font-medium text-white">Cancelar / Desmarcar</h3>
                  <p className="text-xs text-slate-500 font-inter">Busque o paciente para localizar agendamentos</p>
                </div>
              </div>

              {/* Search Patient for Cancel */}
              <form onSubmit={handleSearchCancelPatient} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <StyledInput name="nin" label="CPF do Paciente" placeholder="Apenas números" required />
                  <StyledInput
                    name="birthday"
                    label="Data de Nascimento"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full h-11 rounded-2xl bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-rose-500/30 gap-2 transition-all"
                  disabled={loading === "cancelSearch"}
                >
                  {loading === "cancelSearch" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4" /> Buscar Agendamentos</>}
                </Button>
              </form>

              {cancelSearchError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 mt-4 rounded-2xl bg-rose-500/5 border border-rose-500/20"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <p className="text-sm text-rose-400">{cancelSearchError}</p>
                </motion.div>
              )}

              {cancelPatient && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 mt-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <UserRound className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-white">{cancelPatient.patient_name || "Paciente"}</p>
                  <span className="text-xs text-slate-500 font-mono ml-auto">ID {cancelPatient.patient_id}</span>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                </motion.div>
              )}

              {/* Pending Bookings for Cancel */}
              {pendingBookings.length > 0 && (
                <div className="space-y-3 mt-5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selecione para cancelar</p>
                  </div>
                  <div className="grid gap-3">
                    {pendingBookings.map((pb) => {
                      const isActive = selectedBooking === pb.id;
                      return (
                        <button
                          key={pb.id}
                          type="button"
                          onClick={() => setSelectedBooking(pb.id)}
                          className={cn(
                            "w-full text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden",
                            isActive
                              ? "border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20 shadow-lg shadow-rose-500/5"
                              : "border-white/5 bg-[#0B121D]/60 opacity-60 hover:opacity-100 hover:border-white/10"
                          )}
                        >
                          {isActive && (
                            <div className="absolute top-3 right-3">
                              <Check className="w-4 h-4 text-rose-400" />
                            </div>
                          )}
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{pb.date}</p>
                              <p className={cn(
                                "text-xl font-bold font-outfit flex items-center gap-1.5",
                                isActive ? "text-rose-400" : "text-amber-400"
                              )}>
                                <Clock className="w-4 h-4" /> {pb.hour}
                              </p>
                            </div>
                            <span className={cn(
                              "text-[9px] px-2.5 py-1 rounded-full font-bold uppercase",
                              isActive ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                            )}>
                              {pb.sector || 'CLINIC'}
                            </span>
                          </div>
                          <div className={cn("h-px w-full", isActive ? "bg-rose-500/10" : "bg-white/5")} />
                          <div className="space-y-1.5">
                            <p className="text-sm font-semibold text-white flex items-center gap-2">
                              <Stethoscope className={cn("w-4 h-4", isActive ? "text-rose-400" : "text-amber-400")} />
                              {pb.doctor_name}
                            </p>
                            {pb.service && (
                              <p className="text-xs text-slate-500 flex items-center gap-2 pl-6">
                                <Check className="w-3 h-3 text-emerald-400" />
                                {pb.service}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pl-6">
                              {pb.status && (
                                <span className={cn(
                                  "text-[8px] px-2 py-0.5 rounded-full font-bold uppercase",
                                  isActive ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                                )}>{pb.status}</span>
                              )}
                              {pb.insurance && (
                                <span className="text-[9px] text-slate-500 font-medium uppercase truncate max-w-[120px]">{pb.insurance}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {cancelPatient && patientBookings.length === 0 && pendingBookings.length === 0 && loading !== "cancelSearch" && (
                <div className="py-8 flex flex-col items-center justify-center gap-3 mt-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <CalendarX className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-center text-sm text-slate-500 font-inter">
                    Nenhum agendamento futuro encontrado.
                  </p>
                </div>
              )}

              {/* Cancel Button */}
              <Button
                onClick={handleCancelBooking}
                className="w-full h-12 mt-6 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 hover:brightness-110 transition-all gap-2 text-base"
                disabled={!selectedBooking || loading === "cancel"}
              >
                {loading === "cancel" ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <><Ban className="w-5 h-5" /> Excluir Agendamento</>
                )}
              </Button>

              {cancelResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-2xl text-sm mt-4",
                    cancelResult.success
                      ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/5 border border-rose-500/20 text-rose-400"
                  )}
                >
                  {cancelResult.success ? (
                    <p className="font-medium flex items-center gap-2"><Check className="w-4 h-4" /> Agendamento cancelado com sucesso!</p>
                  ) : (
                    <p className="font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {cancelResult.error}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

        </motion.div>
      </div>
    </motion.div>
  );
}
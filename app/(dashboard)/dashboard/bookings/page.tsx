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
  Plus,
  X,
  Calendar,
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
        "w-full h-11 rounded-2xl border border-[#E8E2D6] bg-white px-4 text-sm text-slate-900 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all",
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
      {label && <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</Label>}
      <Input
        {...rest}
        className={cn(
          "h-11 rounded-2xl border border-[#E8E2D6] bg-white text-slate-900 placeholder:text-slate-400 shadow-sm",
          "focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:border-amber-400 transition-all",
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
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [hasSearchedSlots, setHasSearchedSlots] = useState(false);

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

  // Dynamic filter toggles (Dashboard: data fim e data nascimento opcionais)
  const [showEndDate, setShowEndDate] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [showCancelBirthday, setShowCancelBirthday] = useState(false);

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
    const doctorId = selectedDoctor?.id?.toString() || "10073";
    const addrId = addressId || "1";

    setLoading("slots");
    setFreeSlots([]);
    setSelectedSlot(null);
    setSlotsError(null);
    setHasSearchedSlots(true);

    const formData = new FormData(e.currentTarget);
    const rawStart = (formData.get("startDate") as string) || "";
    const rawEnd = showEndDate ? ((formData.get("endDate") as string) || "") : "";
    const startDate = parseDateBRToISO(rawStart);
    // Se a data fim não estiver selecionada ou for eliminada, a data início duplica para ter o mesmo valor da data fim (mesmo dia):
    const endDate = (rawEnd && rawEnd.trim()) ? parseDateBRToISO(rawEnd) : startDate;

    if (!startDate) {
      setSlotsError("Por favor, preencha a data da consulta.");
      setLoading(null);
      return;
    }

    const res = await fetchFreeSlotsAction(
      doctorId,
      addrId,
      startDate,
      endDate
    );
    if (res.success && Array.isArray(res.data)) {
      setFreeSlots(res.data);
      if (res.data.length === 0) {
        setSlotsError("Nenhuma vaga livre encontrada para esta data.");
      }
    } else {
      setSlotsError(res.error || "Nenhuma vaga livre encontrada para este período.");
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
    const rawNin = (formData.get("nin") as string) || "";
    const nin = rawNin.replace(/\D/g, "");
    const birthdayStr = showBirthday ? (formData.get("birthday") as string) : "";
    const birthday = birthdayStr ? parseDateBRToISO(birthdayStr) : "";

    if (!nin) {
      setPatientSearchError("Digite o CPF do paciente.");
      setLoading(null);
      return;
    }

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
      setPatientSearchError("Paciente não encontrado no Clinic API. Verifique o CPF digitado.");
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
    const rawNin = (formData.get("nin") as string) || "";
    const nin = rawNin.replace(/\D/g, "");
    const birthdayStr = showCancelBirthday ? (formData.get("birthday") as string) : "";
    const birthday = birthdayStr ? parseDateBRToISO(birthdayStr) : "";

    if (!nin) {
      setCancelSearchError("Digite o CPF do paciente.");
      setLoading(null);
      return;
    }

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
      setCancelSearchError("Paciente não encontrado no Clinic API. Verifique o CPF digitado.");
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
      <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-8 text-slate-800 pb-16">
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
              Hospital Otorrinos Curitiba
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
            Central de <span className="font-semibold text-slate-900">Agendamentos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">Gerencie horários, marque consultas e processe cancelamentos na API.</p>
        </motion.div>
        <motion.div variants={item} className="bg-white border border-[#E8E2D6] shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-[32px] p-10 flex flex-col items-center justify-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-amber-700">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="font-semibold text-lg text-slate-900">Médico Responsável Não Selecionado</h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
              Para carregar as vagas e slots da agenda, selecione o especialista nas configurações da clínica.
            </p>
          </div>
          <Button
            onClick={() => window.location.href = "/dashboard/settings"}
            className="bg-[#1E2022] hover:bg-black text-white rounded-2xl px-6 h-11 text-xs font-semibold shadow-sm"
          >
            Configurar Médico Agora
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const groupedSlots = groupSlotsByDate(freeSlots);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-8 text-slate-800 pb-16">

      {/* ═══ HEADER ═══ */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-[#E8E2D6]/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300/80">
              Hospital Otorrinos Curitiba
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
            Agenda & <span className="font-semibold text-slate-900">Consultas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">
            Vagas ativas de <span className="text-slate-900 font-semibold">{selectedDoctor.name}</span>
            {selectedDoctor.crm && <span className="text-slate-600 font-mono"> • CRM {selectedDoctor.crm}</span>}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#E8E2D6] shadow-sm rounded-full p-1 shrink-0">
          <button
            onClick={() => setActiveTab("new")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
              activeTab === "new"
                ? "bg-[#1E2022] text-white shadow-md font-semibold"
                : "text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]"
            )}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Nova Consulta</span>
          </button>
          <button
            onClick={() => setActiveTab("cancel")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
              activeTab === "cancel"
                ? "bg-rose-500 text-white shadow-md font-semibold"
                : "text-slate-700 hover:text-slate-900 hover:bg-[#F4EFE6]"
            )}
          >
            <CalendarX className="w-3.5 h-3.5" />
            <span>Desmarcar / Cancelar</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ═══ LEFT PANEL: Slots Livres ═══ */}
        <motion.div variants={item} className="lg:col-span-2 bg-white border border-[#E8E2D6] rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F0EAE0]">
              <div className="p-2.5 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] text-amber-700">
                <CalendarSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Vagas & Horários Disponíveis</h3>
                <p className="text-xs text-slate-700">Consulte a agenda em tempo real</p>
              </div>
            </div>

            <form onSubmit={handleGetSlots} className="space-y-4">
              {showEndDate ? (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <StyledInput
                      name="startDate"
                      label="Data Início"
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                      required
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Data Fim</Label>
                        <button
                          type="button"
                          onClick={() => setShowEndDate(false)}
                          className="text-[10px] text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" /> Remover
                        </button>
                      </div>
                      <Input
                        name="endDate"
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                        className="h-11 rounded-2xl border border-[#E8E2D6] bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:border-amber-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <StyledInput
                    name="startDate"
                    label="Data da Consulta"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowEndDate(true)}
                      className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors py-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Data Fim (Intervalo)
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-2xl bg-[#1E2022] hover:bg-black text-white font-semibold shadow-sm transition-all gap-2 text-xs"
                disabled={loading === "slots"}
              >
                {loading === "slots" ? <Loader2 className="animate-spin w-4 h-4" /> : <><CalendarSearch className="w-4 h-4 text-amber-400" /> Consultar Vagas Livres</>}
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
                      <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
                      <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
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
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border active:scale-95",
                              isActive
                                ? "bg-[#1E2022] text-white border-[#1E2022] shadow-sm font-semibold"
                                : "bg-[#FBF9F4] text-slate-800 border-[#E8E2D6] hover:bg-[#F2ECE0]"
                            )}
                          >
                            <Clock className="w-3 h-3 text-slate-600" />
                            {time}
                            {isActive && <Check className="w-3 h-3 ml-0.5 text-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : hasSearchedSlots ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2.5 text-center">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <CalendarX className="w-5 h-5 text-amber-700" />
                </div>
                <p className="text-xs text-slate-800 font-semibold">
                  {slotsError || "Nenhuma vaga livre encontrada para esta data."}
                </p>
                <p className="text-[11px] text-slate-600 max-w-[260px]">
                  Tente consultar outra data ou use a opção de intervalo para verificar os próximos dias.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2.5 text-center">
                <div className="w-11 h-11 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D6] flex items-center justify-center text-slate-700">
                  <CalendarSearch className="w-5 h-5 text-slate-700" />
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  Selecione uma data para carregar<br />os horários disponíveis na agenda.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-[#F0EAE0] text-[11px] text-slate-700 flex items-center justify-between">
            <span>Sincronizado via Clinic API</span>
            <span className="font-semibold text-emerald-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Ativo
            </span>
          </div>
        </motion.div>

        {/* ═══ RIGHT PANEL: Action Area ═══ */}
        <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-6">

          {/* ── TAB: NOVA CONSULTA ── */}
          {activeTab === "new" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#E8E2D6] rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 md:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2 pb-3 border-b border-[#F0EAE0]">
                  <div className="p-2.5 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-800">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Agendar Nova Consulta</h3>
                    <p className="text-xs text-slate-700">
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
                    className="flex items-center gap-3 p-3 mt-4 rounded-2xl bg-amber-50 border border-amber-200"
                  >
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="text-xs font-semibold text-amber-900">{formatSlotLabel(selectedSlot).full}</span>
                  </motion.div>
                )}

                {/* Etapa 1: Identificar Paciente */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1E2022] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Identificar Paciente</h4>
                  </div>
                  <form onSubmit={handleSearchPatient} className="space-y-3">
                    {showBirthday ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <div className="grid grid-cols-2 gap-3">
                          <StyledInput
                            name="nin"
                            label="CPF"
                            placeholder="Digite o CPF"
                            maxLength={18}
                            required
                          />
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Data Nasc.</Label>
                              <button
                                type="button"
                                onClick={() => setShowBirthday(false)}
                                className="text-[10px] text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" /> Ocultar
                              </button>
                            </div>
                            <Input
                              name="birthday"
                              placeholder="DD/MM/AAAA"
                              maxLength={10}
                              onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                              className="h-11 rounded-2xl border border-[#E8E2D6] bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:border-amber-400 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <StyledInput
                          name="nin"
                          label="CPF do Paciente"
                          placeholder="Digite o CPF (com ou sem pontuação)"
                          maxLength={18}
                          required
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setShowBirthday(true)}
                            className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors py-0.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Informar Data de Nascimento (Opcional)
                          </button>
                        </div>
                      </div>
                    )}
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full h-11 rounded-2xl bg-white border border-[#E8E2D6] text-slate-800 hover:bg-[#F4EFE6] gap-2 text-xs font-semibold transition-all shadow-sm"
                      disabled={loading === "patientSearch"}
                    >
                      {loading === "patientSearch" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4 text-amber-600" /> Buscar Paciente no Clinic API</>}
                    </Button>
                  </form>

                  {/* Patient Found */}
                  {patientResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <UserRound className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{patientResult.patient_name || "Paciente"}</p>
                        <p className="text-[11px] text-slate-700 font-mono">ID {patientResult.patient_id}</p>
                      </div>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    </motion.div>
                  )}

                  {/* Error */}
                  {patientSearchError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <p>{patientSearchError}</p>
                    </motion.div>
                  )}
                </div>

                {/* Etapa 2: Convênio */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1E2022] text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Convênio</h4>
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
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1E2022] text-amber-400 text-xs flex items-center justify-center font-bold">3</span>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Tipo de Atendimento</h4>
                  </div>
                  <StyledSelect
                    value={selectedAppointmentType ?? ""}
                    onChange={(e) => setSelectedAppointmentType(e.target.value !== "" ? Number(e.target.value) : null)}
                  >
                    <option value="">Selecione um tipo...</option>
                    <option value={0}>1ª Consulta</option>
                    <option value={1}>Consulta Geral</option>
                    <option value={2}>Exame Otorrino</option>
                    <option value={3}>Retorno</option>
                    <option value={4}>Cirurgia</option>
                    <option value={5}>AgendaWEB</option>
                  </StyledSelect>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="pt-6">
                <Button
                  onClick={handleBookSlot}
                  className="w-full h-12 rounded-2xl bg-[#1E2022] hover:bg-black text-white font-semibold shadow-sm transition-all gap-2 text-xs"
                  disabled={!selectedSlot || !patientResult?.patient_id || !selectedInsurance || selectedAppointmentType === null || loading === "book"}
                >
                  {loading === "book" ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <><Sparkles className="w-4 h-4 text-amber-400" /> Confirmar Agendamento no Clinic API</>
                  )}
                </Button>

                {bookResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3.5 rounded-2xl text-xs mt-4 flex items-center gap-2",
                      bookResult.success
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border border-rose-200 text-rose-800"
                    )}
                  >
                    {bookResult.success ? (
                      <p className="font-semibold flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Consulta confirmada com sucesso!</p>
                    ) : (
                      <p className="font-semibold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-600" /> {bookResult.error}</p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TAB: CANCELAR / DESMARCAR ── */}
          {activeTab === "cancel" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#E8E2D6] rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 md:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#F0EAE0]">
                  <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
                    <CalendarX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Cancelar / Desmarcar Consulta</h3>
                    <p className="text-xs text-slate-700">Localize o paciente para processar a desmarcação</p>
                  </div>
                </div>

                {/* Search Patient for Cancel */}
                <form onSubmit={handleSearchCancelPatient} className="space-y-3">
                  {showCancelBirthday ? (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 gap-3">
                        <StyledInput
                          name="nin"
                          label="CPF do Paciente"
                          placeholder="Digite o CPF"
                          maxLength={18}
                          required
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Data Nasc.</Label>
                            <button
                              type="button"
                              onClick={() => setShowCancelBirthday(false)}
                              className="text-[10px] text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Ocultar
                            </button>
                          </div>
                          <Input
                            name="birthday"
                            placeholder="DD/MM/AAAA"
                            maxLength={10}
                            onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                            className="h-11 rounded-2xl border border-[#E8E2D6] bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:border-amber-400 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <StyledInput
                        name="nin"
                        label="CPF do Paciente"
                        placeholder="Digite o CPF (com ou sem pontuação)"
                        maxLength={18}
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowCancelBirthday(true)}
                          className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors py-0.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Informar Data de Nascimento (Opcional)
                        </button>
                      </div>
                    </div>
                  )}
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-11 rounded-2xl bg-white border border-[#E8E2D6] text-slate-800 hover:bg-[#F4EFE6] gap-2 text-xs font-semibold transition-all shadow-sm"
                    disabled={loading === "cancelSearch"}
                  >
                    {loading === "cancelSearch" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4 text-rose-600" /> Buscar Agendamentos</>}
                  </Button>
                </form>

                {cancelSearchError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 mt-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <p>{cancelSearchError}</p>
                  </motion.div>
                )}

                {cancelPatient && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3.5 mt-4 rounded-2xl bg-emerald-50 border border-emerald-200"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <UserRound className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{cancelPatient.patient_name || "Paciente"}</p>
                    <span className="text-[11px] text-slate-700 font-mono ml-auto">ID {cancelPatient.patient_id}</span>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  </motion.div>
                )}

                {/* Pending Bookings for Cancel */}
                {pendingBookings.length > 0 && (
                  <div className="space-y-3 mt-5">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Selecione para cancelar</p>
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
                              "w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2.5 relative cursor-pointer",
                              isActive
                                ? "border-rose-400 bg-rose-50/60 shadow-sm"
                                : "border-[#E8E2D6] bg-[#FBF9F4] hover:bg-[#F2ECE0]"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{pb.date}</p>
                                <p className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                                  <Clock className="w-4 h-4 text-amber-600" /> {pb.hour}
                                </p>
                              </div>
                              <span className="text-[10px] bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-semibold uppercase">
                                #{pb.id}
                              </span>
                            </div>
                            <div className="text-xs text-slate-700">
                              <p className="font-semibold text-slate-900">{pb.doctor_name}</p>
                              {pb.insurance && <p className="text-[11px] text-slate-700">{pb.insurance}</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              <div className="pt-6">
                <Button
                  onClick={handleCancelBooking}
                  className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm transition-all gap-2 text-xs"
                  disabled={!selectedBooking || loading === "cancel"}
                >
                  {loading === "cancel" ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <><Ban className="w-4 h-4" /> Confirmar Cancelamento</>
                  )}
                </Button>

                {cancelResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3.5 rounded-2xl text-xs mt-4 flex items-center gap-2",
                      cancelResult.success
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border border-rose-200 text-rose-800"
                    )}
                  >
                    {cancelResult.success ? (
                      <p className="font-semibold flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Agendamento cancelado com sucesso!</p>
                    ) : (
                      <p className="font-semibold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-600" /> {cancelResult.error}</p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </motion.div>
  );
}
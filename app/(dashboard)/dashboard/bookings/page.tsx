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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function BookingsPage() {
  const { selectedDoctor, addressId } = useClinicSettings();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [freeSlots, setFreeSlots] = useState<string[]>([]);

  // Nova consulta state
  const [insurances, setInsurances] = useState<InsuranceOption[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<number | null>(null);
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

  // Carregar convênios ao montar
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

      // Buscar agendamentos pendentes por NIN/CPF e Birthday
      const bookingRes = await fetchBookingsByNINAction(nin, birthday);
      if (bookingRes.success && bookingRes.data) {
        const found = bookingRes.data as any;

        // CRÍTICO: Usar o address_id que vem do próprio agendamento (se existir) ou fallback
        // O exemplo do usuário mostra doctorId, id, etc. no nível raiz do result
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
    if (!selectedDoctor || !selectedSlot || !patientResult?.patient_id || !selectedInsurance) return;
    setLoading("book");
    const payload = {
      patient_id: patientResult.patient_id,
      healthInsuranceCode: selectedInsurance,
      obs: "Agendado via Dashboard",
      appointmentType: 1,
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
      // Buscar agendamentos desse paciente
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

      // Buscar agendamentos pendentes por NIN/CPF e por lista doutor
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground mt-2">Gerencie horários, marque consultas e processe cancelamentos.</p>
        </div>
        <Card className="bg-background/50 backdrop-blur-md border-chart-4/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-chart-4/10 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-chart-4" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Médico não configurado</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Acesse <strong>Configurações</strong> para selecionar o médico responsável antes de usar os agendamentos.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/dashboard/settings"}>
              Ir para Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(freeSlots);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie horários de <span className="text-foreground font-medium">{selectedDoctor.name}</span>
          {selectedDoctor.crm && <span className="text-muted-foreground"> · CRM {selectedDoctor.crm}</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ Card 1: Buscar Slots ═══ */}
        <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarSearch className="w-5 h-5 text-chart-1" /> Slots Livres
            </CardTitle>
            <CardDescription>Selecione o período para buscar horários disponíveis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleGetSlots} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    name="startDate"
                    type="text"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    name="endDate"
                    type="text"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading === "slots"}>
                {loading === "slots" ? <Loader2 className="animate-spin w-4 h-4" /> : "Buscar Agenda"}
              </Button>
            </form>

            {/* Resultados: Slots como chips */}
            {freeSlots.length > 0 && (
              <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {Object.entries(groupedSlots).map(([dateKey, slots]) => (
                  <div key={dateKey}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {formatDateLabel(dateKey)}
                    </p>
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
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                              "border hover:shadow-sm active:scale-95",
                              isActive
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-background/80 text-foreground border-border/50 hover:border-primary/50 hover:bg-primary/5"
                            )}
                          >
                            <Clock className="w-3 h-3" />
                            {time}
                            {isActive && <Check className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {freeSlots.length === 0 && loading !== "slots" && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Busque um período para ver os horários disponíveis.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ═══ Card 2: Nova Consulta ═══ */}
        <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" /> Nova Consulta
            </CardTitle>
            <CardDescription>
              {selectedSlot
                ? `Horário selecionado: ${formatSlotLabel(selectedSlot).full}`
                : "Selecione um slot livre no card ao lado para começar."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Horário selecionado */}
            {selectedSlot && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in duration-200">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium">{formatSlotLabel(selectedSlot).full}</span>
              </div>
            )}

            {/* Etapa 1: Buscar Paciente */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
                Identificar Paciente
              </h4>
              <form onSubmit={handleSearchPatient} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input name="nin" placeholder="Apenas números" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <Input
                      name="birthday"
                      type="text"
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <Button type="submit" variant="outline" className="w-full gap-2" disabled={loading === "patientSearch"}>
                  {loading === "patientSearch" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4" /> Buscar Paciente</>}
                </Button>
              </form>

              {patientResult && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-chart-2/10 border border-chart-2/20 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-chart-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{patientResult.patient_name || "Paciente"}</p>
                    <p className="text-xs text-muted-foreground">ID: {patientResult.patient_id}</p>
                  </div>
                </div>
              )}

              {/* Agendamentos Pendentes (Encontrados via Telefone) */}
              {pendingBookings.length > 0 && (
                <div className="space-y-2 py-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <p className="text-xs font-bold text-chart-4 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 animate-pulse" /> Atenção: Existe um agendamento para este paciente
                  </p>
                  <div className="grid gap-2">
                    {(() => {
                      const pb = pendingBookings[0];
                      return (
                        <div key={pb.id} className="p-5 rounded-2xl border-2 border-chart-4/40 bg-chart-4/5 flex flex-col gap-4 shadow-lg ring-1 ring-chart-4/10 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group">
                          {/* Efeito Visual de Fundo */}
                          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-chart-4/10 rounded-full blur-3xl group-hover:bg-chart-4/20 transition-colors" />

                          <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-chart-4">
                                <Clock className="w-4 h-4" />
                                <p className="text-2xl font-black">{pb.hour}</p>
                              </div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{pb.date}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] bg-chart-4 text-white px-2.5 py-1 rounded-full font-black uppercase shadow-sm">
                                {pb.sector || 'CLINIC'}
                              </span>
                              {pb.status && (
                                <span className="text-[9px] bg-background/80 border border-chart-4/20 text-chart-4 px-2 py-0.5 rounded-full font-bold uppercase">
                                  {pb.status}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="h-px bg-chart-4/10 w-full" />

                          <div className="space-y-3 relative z-10">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-chart-4/20 flex items-center justify-center shrink-0">
                                <Stethoscope className="w-5 h-5 text-chart-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-muted-foreground uppercase leading-none mb-1">Médico Responsável</p>
                                <p className="text-sm font-black text-foreground truncate">{pb.doctor_name}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {pb.service && (
                                <div className="flex flex-col gap-1">
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Local/Serviço</p>
                                  <p className="text-xs font-bold text-chart-4 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> {pb.service}
                                  </p>
                                </div>
                              )}
                              {pb.insurance && (
                                <div className="flex flex-col gap-1 text-right">
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Convênio</p>
                                  <p className="text-xs font-bold text-foreground truncate">{pb.insurance}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {pb.confirm && (
                            <div className="mt-1 pt-3 border-t border-chart-4/5 flex items-center justify-between">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase italic px-1">
                                Confirmado: <span className="text-chart-2 not-italic">{pb.confirm}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {patientSearchError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{patientSearchError}</p>
                </div>
              )}
            </div>

            {/* Etapa 2: Convênio */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
                Convênio
              </h4>
              <select
                value={selectedInsurance ?? ""}
                onChange={(e) => setSelectedInsurance(Number(e.target.value) || null)}
                className="w-full h-10 rounded-xl border border-border/50 bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              >
                <option value="">Selecione um convênio...</option>
                {insurances.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.name || `Convênio #${ins.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Confirmar */}
            <Button
              onClick={handleBookSlot}
              className="w-full gap-2"
              disabled={!selectedSlot || !patientResult?.patient_id || !selectedInsurance || loading === "book"}
            >
              {loading === "book" ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4" /> Confirmar Marcação
                </>
              )}
            </Button>

            {bookResult && (
              <div className={cn(
                "p-3 rounded-xl text-sm animate-in fade-in duration-200",
                bookResult.success
                  ? "bg-chart-2/10 border border-chart-2/20 text-chart-2"
                  : "bg-destructive/10 border border-destructive/20 text-destructive"
              )}>
                {bookResult.success ? (
                  <p className="font-medium flex items-center gap-2"><Check className="w-4 h-4" /> Consulta agendada com sucesso!</p>
                ) : (
                  <p className="font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {bookResult.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ═══ Card 3: Cancelar ═══ */}
        <Card className="bg-background/50 backdrop-blur-md border-destructive/20 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <CalendarX className="w-5 h-5" /> Cancelar / Desmarcar
            </CardTitle>
            <CardDescription>Busque o paciente para localizar e cancelar agendamentos existentes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Buscar paciente para cancelar */}
            <form onSubmit={handleSearchCancelPatient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>CPF do Paciente</Label>
                  <Input name="nin" placeholder="Apenas números" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    name="birthday"
                    type="text"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    onChange={(e) => { e.target.value = maskDateBR(e.target.value); }}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" className="w-full gap-2" disabled={loading === "cancelSearch"}>
                {loading === "cancelSearch" ? <Loader2 className="animate-spin w-4 h-4" /> : <><Search className="w-4 h-4" /> Buscar Agendamentos</>}
              </Button>
            </form>

            {cancelSearchError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{cancelSearchError}</p>
              </div>
            )}

            {cancelPatient && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-chart-2/10 border border-chart-2/20 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-chart-2 shrink-0" />
                <p className="text-sm font-medium">{cancelPatient.patient_name || "Paciente"} · ID {cancelPatient.patient_id}</p>
              </div>
            )}

            {/* Agendamentos Pendentes (via CPF/NIN) no cancelamento */}
            {pendingBookings.length > 0 && (
              <div className="space-y-2 py-2 animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Selecione o agendamento para cancelar
                </p>
                <div className="grid gap-3">
                  {pendingBookings.map((pb) => {
                    const isActive = selectedBooking === pb.id;
                    return (
                      <button
                        key={pb.id}
                        type="button"
                        onClick={() => setSelectedBooking(pb.id)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex flex-col gap-3 relative overflow-hidden",
                          isActive
                            ? "border-destructive bg-destructive/5 ring-1 ring-destructive/20 shadow-lg shadow-destructive/5 scale-[1.01]"
                            : "border-chart-4/10 bg-chart-4/5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:border-chart-4/30"
                        )}
                      >
                        {isActive && (
                          <div className="absolute top-0 right-0 p-2">
                            <Check className="w-4 h-4 text-destructive" />
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{pb.date}</p>
                            <p className={cn(
                              "text-xl font-black flex items-center gap-1.5",
                              isActive ? "text-destructive" : "text-chart-4"
                            )}>
                              <Clock className="w-4 h-4" /> {pb.hour}
                            </p>
                          </div>
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 rounded font-bold uppercase border",
                            isActive ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-chart-4/20 text-chart-4 border-chart-4/30"
                          )}>
                            {pb.sector || 'CLINIC'}
                          </span>
                        </div>

                        <div className={cn("h-px w-full", isActive ? "bg-destructive/10" : "bg-chart-4/10")} />

                        <div className="space-y-1.5">
                          <p className="text-xs font-bold text-foreground flex items-center gap-2">
                            <Stethoscope className={cn("w-4 h-4", isActive ? "text-destructive" : "text-chart-4")} />
                            {pb.doctor_name}
                          </p>
                          {pb.service && (
                            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 px-6">
                              <Check className="w-3 h-3 text-chart-2" />
                              {pb.service}
                            </p>
                          )}
                          {(pb.status || pb.insurance) && (
                            <div className="flex items-center gap-2 px-6 pt-1">
                              {pb.status && (
                                <span className={cn(
                                  "text-[8px] px-1.5 py-0.5 rounded font-black uppercase",
                                  isActive ? "bg-destructive/10 text-destructive" : "bg-chart-4/10 text-chart-4"
                                )}>{pb.status}</span>
                              )}
                              {pb.insurance && (
                                <span className="text-[8px] text-muted-foreground font-bold uppercase truncate max-w-[100px]">{pb.insurance}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {cancelPatient && patientBookings.length === 0 && loading !== "cancelSearch" && (
              <p className="text-center text-sm text-muted-foreground py-3">
                Nenhum agendamento futuro encontrado para este paciente.
              </p>
            )}

            {/* Botão cancelar */}
            <Button
              onClick={handleCancelBooking}
              variant="destructive"
              className="w-full gap-2"
              disabled={!selectedBooking || loading === "cancel"}
            >
              {loading === "cancel" ? <Loader2 className="animate-spin w-4 h-4" /> : <><CalendarX className="w-4 h-4" /> Excluir Agendamento</>}
            </Button>

            {cancelResult && (
              <div className={cn(
                "p-3 rounded-xl text-sm animate-in fade-in duration-200",
                cancelResult.success
                  ? "bg-chart-2/10 border border-chart-2/20 text-chart-2"
                  : "bg-destructive/10 border border-destructive/20 text-destructive"
              )}>
                {cancelResult.success ? (
                  <p className="font-medium flex items-center gap-2"><Check className="w-4 h-4" /> Agendamento cancelado com sucesso!</p>
                ) : (
                  <p className="font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {cancelResult.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
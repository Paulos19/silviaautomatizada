"use server";

import prisma from "@/lib/prisma";
import { ClinicService } from "@/services/clinic.service";

const DOCTOR_ID = process.env.CLINIC_DOCTOR_ID || "10073";
const ADDRESS_ID = process.env.CLINIC_ADDRESS_ID || "1";
const ORCHESTRATOR_API_URL =
  process.env.ORCHESTRATOR_API_URL ||
  process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL ||
  "https://n8n-silvia-py.yyuhkk.easypanel.host";

export interface UpcomingBookingItem {
  id: string; // Booking ID na Clinic
  client: string; // Nome bruto da Clinic (ex: HENDRYUS TATARIN)
  patientName: string; // Nome formatado (ex: Hendryus Tatarin)
  firstName: string; // Primeiro nome (ex: Hendryus)
  mobile: string; // Telefone com DDI 55 (ex: 5541999035798)
  formattedPhone: string; // Telefone legível (ex: (41) 99903-5798)
  dateSchedule: string; // Data formatada (ex: 15/10/2026)
  hourSchedule: string; // Horário formatado HH:MM (ex: 15:15)
  dateTimeDisplay: string; // Ex: 15/10/2026 às 15:15
  doctorName: string;
  doctorId: string;
  addressId: string;
  healthInsurance: string;
  confirm: string; // "A Confirmar" | "Confirmado"
  status: string; // "Paciente atendido", "Paciente faltou", etc.
  dayOffset: number; // 0 = Hoje, 1 = Amanhã (24h), 2 = Depois de amanhã (48h)
  dayLabel: "Hoje" | "Amanhã" | "Em 2 dias" | "Outro";
  isDispatched: boolean;
  dispatchStatus: "ENVIADO" | "ERRO" | "CONFIRMADO" | null;
  lastDispatchedAt?: string | null;
  notificationType?: string | null;
  previewMessage: string;
}

export interface UpcomingBookingsSummary {
  total: number;
  pendingDispatch: number;
  dispatchedCount: number;
  confirmedCount: number;
  todayCount: number;
  tomorrowCount: number;
  dayAfterCount: number;
}

/**
 * Converte strings em Title Case respeitando preposições
 */
function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (["de", "da", "do", "das", "dos", "e"].includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Normaliza número de telefone celular brasileiro (DDI 55 + DDD + 9 dígitos)
 */
function normalizePhone(rawPhone: string): { clean: string; display: string } {
  let digits = (rawPhone || "").replace(/\D/g, "");
  if (!digits) return { clean: "", display: "" };

  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }

  // Se tem 12 dígitos (55 + 2 DDD + 8 dígitos de celular antigo), insere o 9
  if (digits.length === 12 && digits.startsWith("55")) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    digits = `55${ddd}9${rest}`;
  }

  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  let display = digits;
  if (local.length === 11) {
    display = `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  } else if (local.length === 10) {
    display = `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }

  return { clean: digits, display };
}

/**
 * Extrai e normaliza horário para HH:MM
 */
function normalizeTime(rawHour: string): string {
  if (!rawHour) return "";
  const parts = rawHour.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return rawHour;
}

/**
 * Converte data da Clinic (DD/MM/YYYY ou YYYY-MM-DD) para DD/MM/YYYY e Date
 */
function parseClinicDate(rawDate: string): { displayDate: string; dateObj: Date | null } {
  if (!rawDate) return { displayDate: "", dateObj: null };

  if (rawDate.includes("/")) {
    const parts = rawDate.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return { displayDate: rawDate, dateObj: d };
    }
  }

  if (rawDate.includes("-")) {
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const displayDate = `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
      return { displayDate, dateObj: d };
    }
  }

  return { displayDate: rawDate, dateObj: null };
}

/**
 * Template oficial e humanizado de confirmação de consulta
 */
function buildConfirmationMessage(
  firstName: string,
  dateSchedule: string,
  hourSchedule: string
): string {
  return (
    `Olá, ${firstName}! Tudo bem? 😊\n` +
    `Aqui é a Silv.IA do consultório do Dr. Marco Antonio.\n\n` +
    `Passando para confirmar sua consulta agendada para o dia *${dateSchedule}* às *${hourSchedule}*.\n\n` +
    `📍 *Nosso endereço:*\n` +
    `Rua Dr. Roberto Barrozo, 1379, 2º andar\n` +
    `Hospital Otorrinos Curitiba\n` +
    `https://maps.google.com/?q=-25.415823,-49.282524\n\n` +
    `Você confirma sua presença para este dia?`
  );
}

/**
 * Busca agendamentos próximos (D+0, D+1, D+2) diretamente da API da clínica,
 * normaliza os campos com dados reais e cruza com os disparos do banco de dados.
 */
export async function fetchUpcomingBookingsAction(daysAhead: number = 2): Promise<{
  success: boolean;
  data?: {
    bookings: UpcomingBookingItem[];
    summary: UpcomingBookingsSummary;
  };
  error?: string;
}> {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysAhead);
    const endDateStr = endDate.toISOString().split("T")[0];

    // Consulta na API da Clinic
    const rawRes = await ClinicService.getDoctorBookings(
      DOCTOR_ID,
      ADDRESS_ID,
      todayStr,
      endDateStr
    ).catch((err: any) => {
      console.error("[fetchUpcomingBookingsAction] Erro Clinic API:", err.message);
      return { result: { items: [] } };
    });

    let rawItems: any[] = [];
    if (Array.isArray(rawRes)) {
      rawItems = rawRes;
    } else if (rawRes && typeof rawRes === "object") {
      rawItems = rawRes.items || rawRes.result?.items || rawRes.data || [];
    }

    if (!rawItems.length) {
      return {
        success: true,
        data: {
          bookings: [],
          summary: {
            total: 0,
            pendingDispatch: 0,
            dispatchedCount: 0,
            confirmedCount: 0,
            todayCount: 0,
            tomorrowCount: 0,
            dayAfterCount: 0,
          },
        },
      };
    }

    // Coleta IDs para cruzar com a tabela de disparos realizados
    const bookingIds = rawItems.map((item) => String(item.id)).filter(Boolean);

    const existingConfirmations = await (prisma as any).appointmentConfirmation.findMany({
      where: {
        bookingId: { in: bookingIds },
      },
      orderBy: { sentAt: "desc" },
    });

    const confirmationMap = new Map<string, any>();
    for (const conf of existingConfirmations) {
      if (!confirmationMap.has(conf.bookingId)) {
        confirmationMap.set(conf.bookingId, conf);
      }
    }

    // Mapeamento e normalização estrita
    const bookings: UpcomingBookingItem[] = [];

    const todayDayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (const item of rawItems) {
      const id = String(item.id || "");
      const rawClient = String(item.client || item.patient_name || "").trim();
      const patientName = toTitleCase(rawClient) || "Paciente";
      const firstName = patientName.split(" ")[0] || "Paciente";

      const rawPhone = String(item.mobile || item.phone || item.patient_phone || "");
      const { clean: mobile, display: formattedPhone } = normalizePhone(rawPhone);

      const rawDate = String(item.date_schedule || item.date || "");
      const { displayDate: dateSchedule, dateObj } = parseClinicDate(rawDate);

      const rawHour = String(item.hour_schedule || item.hour || item.time || "");
      const hourSchedule = normalizeTime(rawHour);

      const dateTimeDisplay = `${dateSchedule || "Data a definir"} às ${hourSchedule || "Horário a definir"}`;
      const doctorName = String(item.doctor || "Dr. Marco Antonio Teixeira da Silva");
      const healthInsurance = String(item.healthInsurance || "Particular");
      const confirm = String(item.confirm || "A Confirmar");
      const status = String(item.status || "Agendado");

      // Calcula a diferença em dias a partir de hoje
      let dayOffset = 0;
      let dayLabel: "Hoje" | "Amanhã" | "Em 2 dias" | "Outro" = "Outro";

      if (dateObj) {
        const itemDayOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const diffMs = itemDayOnly.getTime() - todayDayOnly.getTime();
        dayOffset = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (dayOffset === 0) dayLabel = "Hoje";
        else if (dayOffset === 1) dayLabel = "Amanhã";
        else if (dayOffset === 2) dayLabel = "Em 2 dias";
      }

      const conf = confirmationMap.get(id);
      const isDispatched = !!conf && conf.status === "ENVIADO";
      const dispatchStatus = conf ? (conf.status as any) : null;
      const lastDispatchedAt = conf ? conf.sentAt.toISOString() : null;
      const notificationType = conf ? conf.notificationType : null;

      const previewMessage = buildConfirmationMessage(firstName, dateSchedule, hourSchedule);

      bookings.push({
        id,
        client: rawClient,
        patientName,
        firstName,
        mobile,
        formattedPhone,
        dateSchedule,
        hourSchedule,
        dateTimeDisplay,
        doctorName,
        doctorId: DOCTOR_ID,
        addressId: ADDRESS_ID,
        healthInsurance,
        confirm,
        status,
        dayOffset,
        dayLabel,
        isDispatched,
        dispatchStatus,
        lastDispatchedAt,
        notificationType,
        previewMessage,
      });
    }

    // Ordenação cronológica (por dia e horário)
    bookings.sort((a, b) => {
      if (a.dayOffset !== b.dayOffset) return a.dayOffset - b.dayOffset;
      return a.hourSchedule.localeCompare(b.hourSchedule);
    });

    const summary: UpcomingBookingsSummary = {
      total: bookings.length,
      pendingDispatch: bookings.filter((b) => !b.isDispatched).length,
      dispatchedCount: bookings.filter((b) => b.isDispatched).length,
      confirmedCount: bookings.filter((b) => b.confirm === "Confirmado").length,
      todayCount: bookings.filter((b) => b.dayOffset === 0).length,
      tomorrowCount: bookings.filter((b) => b.dayOffset === 1).length,
      dayAfterCount: bookings.filter((b) => b.dayOffset === 2).length,
    };

    return { success: true, data: { bookings, summary } };
  } catch (error: any) {
    console.error("[fetchUpcomingBookingsAction] Erro fatal:", error);
    return { success: false, error: "Falha ao carregar agendamentos próximos." };
  }
}

/**
 * Dispara uma única confirmação específica via Silvia (registrando na memória da IA)
 * e salvando o registro no banco para auditoria.
 */
export async function dispatchSingleConfirmationAction(booking: {
  id: string;
  client: string;
  mobile: string;
  dateSchedule: string;
  hourSchedule: string;
  doctorName?: string;
  healthInsurance?: string;
  dayOffset?: number;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const rawClient = String(booking.client || "").trim();
    if (!rawClient || rawClient.toLowerCase() === "paciente") {
      return { success: false, error: "Nome do paciente inválido ou ausente." };
    }

    const { clean: phone } = normalizePhone(booking.mobile);
    if (!phone || phone.length < 10) {
      return { success: false, error: "Número de WhatsApp do paciente inválido." };
    }

    const dateSchedule = booking.dateSchedule;
    const hourSchedule = normalizeTime(booking.hourSchedule);

    if (!dateSchedule || !hourSchedule) {
      return { success: false, error: "Data ou horário da consulta ausente." };
    }

    const patientName = toTitleCase(rawClient);
    const firstName = patientName.split(" ")[0];
    const messageText = buildConfirmationMessage(firstName, dateSchedule, hourSchedule);

    let sentViaOrchestrator = false;

    // 1. Tenta disparar através do agente Python (FastAPI), que insere no contexto de memória da Silvia
    try {
      const pyResp = await fetch(`${ORCHESTRATOR_API_URL}/orchestrator/dispatch-single-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          client: rawClient,
          mobile: phone,
          date_schedule: dateSchedule,
          hour_schedule: hourSchedule,
          doctor: booking.doctorName || "Dr. Marco Antonio",
          healthInsurance: booking.healthInsurance || "Particular",
        }),
      });

      if (pyResp.ok) {
        const pyData = await pyResp.json();
        if (pyData.success) {
          sentViaOrchestrator = true;
        }
      }
    } catch (pyErr: any) {
      console.warn("[dispatchSingleConfirmationAction] Python Orchestrator indisponível, usando fallback:", pyErr.message);
    }

    // 2. Fallback via Evolution API se o orchestrator Python estiver temporariamente offline
    if (!sentViaOrchestrator) {
      const evoUrl = process.env.EVOLUTION_API_URL;
      const evoKey = process.env.EVOLUTION_API_KEY;
      const evoInst = process.env.EVOLUTION_INSTANCE || "henrique";

      if (!evoUrl || !evoKey) {
        return { success: false, error: "Credenciais de WhatsApp não configuradas no servidor." };
      }

      const evoResp = await fetch(`${evoUrl}/message/sendText/${evoInst}`, {
        method: "POST",
        headers: {
          apikey: evoKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: phone,
          text: messageText,
        }),
      });

      if (!evoResp.ok) {
        return { success: false, error: "Falha ao enviar mensagem via Evolution API." };
      }
    }

    // 3. Registra no banco de dados para rastreamento e auditoria
    const notificationType = booking.dayOffset === 1 ? "24H" : booking.dayOffset === 2 ? "48H" : "MANUAL";
    const { dateObj } = parseClinicDate(dateSchedule);

    await (prisma as any).appointmentConfirmation.upsert({
      where: {
        id: (await (prisma as any).appointmentConfirmation.findFirst({
          where: { bookingId: String(booking.id), notificationType },
          select: { id: true },
        }))?.id || "temp-new-id",
      },
      create: {
        bookingId: String(booking.id),
        patientName,
        phone,
        doctorName: booking.doctorName || "Dr. Marco Antonio Teixeira da Silva",
        appointmentDate: dateObj || new Date(),
        notificationType,
        status: "ENVIADO",
        sentAt: new Date(),
      },
      update: {
        patientName,
        phone,
        status: "ENVIADO",
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Mensagem enviada com sucesso para ${firstName} (${dateSchedule} às ${hourSchedule})!`,
    };
  } catch (err: any) {
    console.error("[dispatchSingleConfirmationAction] Erro:", err);
    return { success: false, error: err.message || "Falha ao enviar confirmação." };
  }
}

/**
 * Dispara confirmações em lote para múltiplos agendamentos pendentes
 */
export async function batchDispatchConfirmationsAction(bookings: UpcomingBookingItem[]): Promise<{
  success: boolean;
  dispatched: number;
  errors: number;
}> {
  let dispatched = 0;
  let errors = 0;

  for (const b of bookings) {
    try {
      const res = await dispatchSingleConfirmationAction({
        id: b.id,
        client: b.client,
        mobile: b.mobile,
        dateSchedule: b.dateSchedule,
        hourSchedule: b.hourSchedule,
        doctorName: b.doctorName,
        healthInsurance: b.healthInsurance,
        dayOffset: b.dayOffset,
      });

      if (res.success) dispatched++;
      else errors++;

      // Pequena pausa para evitar bloqueios ou rate limit no WhatsApp
      await new Promise((r) => setTimeout(r, 1200));
    } catch {
      errors++;
    }
  }

  return { success: true, dispatched, errors };
}

/**
 * Confirma o agendamento diretamente no sistema Clinic
 */
export async function confirmBookingInClinicAction(bookingId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (!bookingId) return { success: false, error: "ID do agendamento é obrigatório." };

    await ClinicService.setBookingConfirmation(DOCTOR_ID, ADDRESS_ID, bookingId, "confirmed");

    // Atualiza status local se existir
    await (prisma as any).appointmentConfirmation.updateMany({
      where: { bookingId },
      data: { status: "CONFIRMADO", respondedAt: new Date() },
    });

    return { success: true, message: "Agendamento confirmado no sistema da clínica!" };
  } catch (error: any) {
    console.error("[confirmBookingInClinicAction] Erro:", error.message);
    return { success: false, error: "Falha ao confirmar agendamento no sistema da clínica." };
  }
}

/**
 * Rotina automática das 08h00 para disparos matinais (mantém compatibilidade)
 */
export async function runMorningConfirmationDispatchAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const upcoming = await fetchUpcomingBookingsAction(2);
    if (!upcoming.success || !upcoming.data) {
      return { success: false, error: upcoming.error || "Falha ao buscar agendamentos." };
    }

    // Filtra agendamentos de amanhã (D+1) e depois de amanhã (D+2) ainda não disparados
    const candidates = upcoming.data.bookings.filter(
      (b) => (b.dayOffset === 1 || b.dayOffset === 2) && !b.isDispatched && b.mobile
    );

    const batchRes = await batchDispatchConfirmationsAction(candidates);

    return {
      success: true,
      data: {
        totalProcessed: candidates.length,
        dispatched: batchRes.dispatched,
        errors: batchRes.errors,
      },
    };
  } catch (error: any) {
    console.error("[runMorningConfirmationDispatchAction] Erro:", error);
    return { success: false, error: "Falha ao executar rotina matinal." };
  }
}

/**
 * Consulta histórico recente de confirmações
 */
export async function fetchConfirmationHistoryAction() {
  try {
    const list = await (prisma as any).appointmentConfirmation.findMany({
      orderBy: { sentAt: "desc" },
      take: 50,
    });
    return { success: true, data: list };
  } catch (error: any) {
    console.error("[fetchConfirmationHistoryAction] Erro:", error);
    return { success: false, error: "Falha ao carregar histórico." };
  }
}

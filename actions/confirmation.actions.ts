"use server";

import prisma from "@/lib/prisma";
import { ClinicService } from "@/services/clinic.service";
import { matchWaitlistForSlotAction, notifyWaitlistOfferAction } from "@/actions/waitlist.actions";

const DOCTOR_ID = process.env.CLINIC_DOCTOR_ID || "10073";
const ADDRESS_ID = process.env.CLINIC_ADDRESS_ID || "1";
const ORCHESTRATOR_API_URL =
  process.env.ORCHESTRATOR_API_URL ||
  process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL ||
  "https://n8n-silvia-py.yyuhkk.easypanel.host";

export type NoticeType =
  | "48H"               // 1º Aviso (08h00 - 48h antes)
  | "24H_AVISO"         // 2º e último aviso com alerta de cancelamento (14h00 - 24h antes)
  | "24H_LEMBRETE"      // Lembrete passivo para quem já confirmou (14h00 - 24h antes)
  | "ANTECIPADO_SEXTA"  // Antecipação de segunda/terça enviada na sexta (08h00)
  | "CANCELADO_INACAO"  // Cancelado por falta de retorno e vaga dada à lista de espera
  | "MANUAL";

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
  dayOffset: number; // 0 = Hoje, 1 = Amanhã (24h), 2 = Em 2 dias (48h), 3 = Segunda (72h), etc.
  dayLabel: "Hoje" | "Amanhã" | "Em 2 dias" | "Segunda (72h)" | "Terça (96h)" | "Outro";
  isDispatched: boolean;
  dispatchStatus: "ENVIADO" | "ERRO" | "CONFIRMADO" | null;
  lastDispatchedAt?: string | null;
  notificationType?: string | null;
  previewMessage: string;
  targetNoticeType: NoticeType;
  suggestedScheduleTime: "08:00" | "14:00";
  noticeTitle: string;
}

export interface UpcomingBookingsSummary {
  total: number;
  pendingDispatch: number;
  dispatchedCount: number;
  confirmedCount: number;
  todayCount: number;
  tomorrowCount: number;
  dayAfterCount: number;
  pendingMorningCount: number; // 08h00 (48h e antecipações)
  pendingAfternoonNoticeCount: number; // 14h00 (24h - 2º aviso)
  pendingAfternoonReminderCount: number; // 14h00 (24h - lembrete confirmado)
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

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES INTELIGENTES DE MENSAGENS (48h, 24h Não Confirmada, 24h Confirmada, Cancelamento)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1º Aviso de Confirmação (Disparo das 08h00 - 48h antes ou antecipado na sexta)
 */
function buildFirstNoticeMessage(
  firstName: string,
  dateSchedule: string,
  hourSchedule: string,
  isAdvanceWeekend: boolean = false
): string {
  if (isAdvanceWeekend) {
    return (
      `Olá, ${firstName}! Tudo bem? 😊\n` +
      `Aqui é a Silv.IA do consultório do Dr. Marco Antonio.\n\n` +
      `Como nosso consultório não opera aos finais de semana, estamos antecipando o contato para confirmar sua consulta da próxima *segunda-feira, ${dateSchedule}* às *${hourSchedule}*.\n\n` +
      `📍 *Nosso endereço:*\n` +
      `Rua Dr. Roberto Barrozo, 1379, 2º andar\n` +
      `Hospital Otorrinos Curitiba\n` +
      `https://maps.google.com/?q=-25.415823,-49.282524\n\n` +
      `Você confirma sua presença para este dia?`
    );
  }

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
 * 2º e Último Aviso de Confirmação (Disparo das 14h00 - 24h antes, caso AINDA NÃO confirmada)
 * Alerta com urgência sobre cancelamento e liberação para a Lista de Espera.
 */
function buildSecondNoticeMessage(
  firstName: string,
  dateSchedule: string,
  hourSchedule: string
): string {
  return (
    `Olá, ${firstName}! Aqui é a Silv.IA do consultório do Dr. Marco Antonio.\n\n` +
    `Este é o nosso *segundo e último aviso* para confirmação da sua consulta de amanhã, *${dateSchedule}* às *${hourSchedule}*.\n\n` +
    `⚠️ Como ainda não tivemos seu retorno, precisamos que nos confirme sua presença com urgência. Caso não haja confirmação, sua consulta infelizmente precisará ser cancelada e disponibilizada para um paciente que aguarda na nossa lista de espera.\n\n` +
    `📍 *Endereço:* Rua Dr. Roberto Barrozo, 1379, 2º andar - Hospital Otorrinos Curitiba\n\n` +
    `Podemos confirmar sua consulta para amanhã?`
  );
}

/**
 * Lembrete de Presença (Disparo das 14h00 - 24h antes, caso JÁ CONFIRMADA)
 * Mensagem cordial informativa, sem necessidade de resposta do paciente.
 */
function buildReminderConfirmedMessage(
  firstName: string,
  dateSchedule: string,
  hourSchedule: string
): string {
  return (
    `Olá, ${firstName}! Tudo bem? 😊\n` +
    `Aqui é a Silv.IA do consultório do Dr. Marco Antonio.\n\n` +
    `Passando apenas para lembrar da sua consulta agendada para amanhã, dia *${dateSchedule}* às *${hourSchedule}*.\n\n` +
    `Como você já confirmou sua presença anteriormente, *não é necessário responder esta mensagem*. Estamos te aguardando!\n\n` +
    `📍 *Nosso endereço:*\n` +
    `Rua Dr. Roberto Barrozo, 1379, 2º andar\n` +
    `Hospital Otorrinos Curitiba\n` +
    `https://maps.google.com/?q=-25.415823,-49.282524\n\n` +
    `Até amanhã!`
  );
}

/**
 * Aviso de Cancelamento por Falta de Confirmação (Ao dar a vaga para a Lista de Espera)
 */
function buildCancellationDueToInactionMessage(
  firstName: string,
  dateSchedule: string,
  hourSchedule: string
): string {
  return (
    `Olá, ${firstName}. Aqui é a Silv.IA do consultório do Dr. Marco Antonio.\n\n` +
    `Como não tivemos a confirmação da sua consulta agendada para hoje (*${dateSchedule} às ${hourSchedule}*), o horário foi cancelado no sistema e disponibilizado para o próximo paciente da lista de espera.\n\n` +
    `Caso queira remarcar sua consulta para uma nova data, basta nos responder por aqui que te ajudaremos com os novos horários disponíveis. Tenha um ótimo dia!`
  );
}

/**
 * Seleciona o template correto para o agendamento
 */
function resolveMessageForBooking(
  firstName: string,
  dateSchedule: string,
  hourSchedule: string,
  noticeType: NoticeType
): string {
  switch (noticeType) {
    case "48H":
      return buildFirstNoticeMessage(firstName, dateSchedule, hourSchedule, false);
    case "ANTECIPADO_SEXTA":
      return buildFirstNoticeMessage(firstName, dateSchedule, hourSchedule, true);
    case "24H_AVISO":
      return buildSecondNoticeMessage(firstName, dateSchedule, hourSchedule);
    case "24H_LEMBRETE":
      return buildReminderConfirmedMessage(firstName, dateSchedule, hourSchedule);
    case "CANCELADO_INACAO":
      return buildCancellationDueToInactionMessage(firstName, dateSchedule, hourSchedule);
    default:
      return buildFirstNoticeMessage(firstName, dateSchedule, hourSchedule, false);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTA E PROCESSAMENTO DE AGENDAMENTOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Busca agendamentos próximos diretamente da API da clínica,
 * normaliza os campos com dados reais, classifica o tipo de aviso (48h/24h)
 * e o horário programado de disparo (08h00 ou 14h00), aplicando a regra de fim de semana.
 */
export async function fetchUpcomingBookingsAction(daysAhead: number = 4): Promise<{
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
    const todayDayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ..., 5 = Sexta, 6 = Sábado
    const isFriday = todayDayOfWeek === 5;

    // Na sexta-feira, buscamos pelo menos até terça-feira (D+4) para capturar segunda (D+3) e terça
    const actualDaysAhead = isFriday ? Math.max(daysAhead, 4) : Math.max(daysAhead, 2);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + actualDaysAhead);
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
            pendingMorningCount: 0,
            pendingAfternoonNoticeCount: 0,
            pendingAfternoonReminderCount: 0,
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
      let dayLabel: "Hoje" | "Amanhã" | "Em 2 dias" | "Segunda (72h)" | "Terça (96h)" | "Outro" = "Outro";

      if (dateObj) {
        const itemDayOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const diffMs = itemDayOnly.getTime() - todayDayOnly.getTime();
        dayOffset = Math.round(diffMs / (1000 * 60 * 60 * 24));
      }

      // Identifica se a consulta já está confirmada (na Clinic ou no banco)
      const isClinicConfirmed = confirm.toLowerCase().includes("confirmado");
      const dbConfirmRecord = existingConfirmations.find(
        (c: any) => c.bookingId === id && c.status === "CONFIRMADO"
      );
      const isConfirmed = isClinicConfirmed || Boolean(dbConfirmRecord);

      // Determinação do Tipo de Aviso e Horário Programado de Envio:
      // - 08h00: 48h (D+2), e na sexta-feira antecipações de segunda (D+3) e terça (D+4)
      // - 14h00: 24h (D+1) — 2º aviso se pendente, ou lembrete cordial se já confirmado
      let targetNoticeType: NoticeType = "48H";
      let suggestedScheduleTime: "08:00" | "14:00" = "08:00";
      let noticeTitle = "1º Aviso de Confirmação";

      if (dayOffset === 0) {
        dayLabel = "Hoje";
        suggestedScheduleTime = "08:00";
        targetNoticeType = isConfirmed ? "24H_LEMBRETE" : "24H_AVISO";
        noticeTitle = isConfirmed ? "Lembrete do Dia (Confirmado)" : "Urgente (Hoje - Pendente)";
      } else if (dayOffset === 1) {
        dayLabel = "Amanhã";
        suggestedScheduleTime = "14:00"; // 24h é SEMPRE às 14h!
        targetNoticeType = isConfirmed ? "24H_LEMBRETE" : "24H_AVISO";
        noticeTitle = isConfirmed ? "Lembrete de Presença (24h - Confirmado)" : "2º e Último Aviso (24h - Urgente)";
      } else if (dayOffset === 2) {
        dayLabel = "Em 2 dias";
        suggestedScheduleTime = "08:00"; // 48h é às 08h!
        targetNoticeType = "48H";
        noticeTitle = "1º Aviso de Confirmação (48h)";
      } else if (dayOffset === 3) {
        dayLabel = "Segunda (72h)";
        suggestedScheduleTime = "08:00";
        targetNoticeType = isFriday ? "ANTECIPADO_SEXTA" : "48H";
        noticeTitle = isFriday ? "1º Aviso Antecipado de Segunda (Sexta)" : "Aviso de Confirmação (72h)";
      } else if (dayOffset === 4) {
        dayLabel = "Terça (96h)";
        suggestedScheduleTime = "08:00";
        targetNoticeType = isFriday ? "ANTECIPADO_SEXTA" : "48H";
        noticeTitle = isFriday ? "Aviso Antecipado de Terça (Sexta)" : "Aviso de Confirmação (96h)";
      } else {
        dayLabel = "Outro";
        suggestedScheduleTime = "08:00";
        targetNoticeType = "48H";
        noticeTitle = "Aviso de Confirmação";
      }

      const previewMessage = resolveMessageForBooking(firstName, dateSchedule, hourSchedule, targetNoticeType);

      // Checa se JÁ foi disparado ESPECIFICAMENTE o aviso correspondente para esta consulta
      const matchingNotice = existingConfirmations.find((c: any) => {
        if (c.bookingId !== id) return false;
        if (suggestedScheduleTime === "14:00") {
          return c.notificationType?.startsWith("24H") || c.notificationType === "24H";
        } else {
          return c.notificationType === "48H" || c.notificationType === "ANTECIPADO_SEXTA";
        }
      });

      const isDispatched = !!matchingNotice && matchingNotice.status === "ENVIADO";
      const dispatchStatus = matchingNotice ? (matchingNotice.status as any) : null;
      const lastDispatchedAt = matchingNotice ? matchingNotice.sentAt.toISOString() : null;
      const notificationType = matchingNotice ? matchingNotice.notificationType : null;

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
        targetNoticeType,
        suggestedScheduleTime,
        noticeTitle,
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
      confirmedCount: bookings.filter((b) => b.confirm.toLowerCase().includes("confirmado")).length,
      todayCount: bookings.filter((b) => b.dayOffset === 0).length,
      tomorrowCount: bookings.filter((b) => b.dayOffset === 1).length,
      dayAfterCount: bookings.filter((b) => b.dayOffset === 2).length,
      pendingMorningCount: bookings.filter(
        (b) => !b.isDispatched && b.suggestedScheduleTime === "08:00"
      ).length,
      pendingAfternoonNoticeCount: bookings.filter(
        (b) => !b.isDispatched && b.suggestedScheduleTime === "14:00" && b.targetNoticeType === "24H_AVISO"
      ).length,
      pendingAfternoonReminderCount: bookings.filter(
        (b) => !b.isDispatched && b.suggestedScheduleTime === "14:00" && b.targetNoticeType === "24H_LEMBRETE"
      ).length,
    };

    return { success: true, data: { bookings, summary } };
  } catch (error: any) {
    console.error("[fetchUpcomingBookingsAction] Erro fatal:", error);
    return { success: false, error: "Falha ao carregar agendamentos próximos." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPAROS DE CONFIRMAÇÃO (INDIVIDUAL E EM LOTE)
// ─────────────────────────────────────────────────────────────────────────────

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
  noticeType?: NoticeType;
  customMessage?: string;
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

    // Infere o noticeType se não for fornecido
    const noticeType: NoticeType = booking.noticeType || (
      booking.dayOffset === 1 ? "24H_AVISO" : booking.dayOffset === 2 ? "48H" : "MANUAL"
    );

    const messageText = booking.customMessage || resolveMessageForBooking(firstName, dateSchedule, hourSchedule, noticeType);

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
          notice_type: noticeType,
          custom_message: messageText,
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
      const evoInst = process.env.EVOLUTION_INSTANCE || "Silvia";

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
    const { dateObj } = parseClinicDate(dateSchedule);

    await (prisma as any).appointmentConfirmation.upsert({
      where: {
        id: (await (prisma as any).appointmentConfirmation.findFirst({
          where: { bookingId: String(booking.id), notificationType: noticeType },
          select: { id: true },
        }))?.id || "temp-new-id",
      },
      create: {
        bookingId: String(booking.id),
        patientName,
        phone,
        doctorName: booking.doctorName || "Dr. Marco Antonio Teixeira da Silva",
        appointmentDate: dateObj || new Date(),
        notificationType: noticeType,
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
      message: `Mensagem (${noticeType}) enviada com sucesso para ${firstName} (${dateSchedule} às ${hourSchedule})!`,
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
        noticeType: b.targetNoticeType,
      });

      if (res.success) dispatched++;
      else errors++;

      // Intervalo suave de 1.2s para evitar bloqueios no WhatsApp
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

// ─────────────────────────────────────────────────────────────────────────────
// ROTINAS CRON: 08h00 (MANHÃ) E 14h00 (TARDE) + CANCELAMENTO AUTOMÁTICO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rotina automática das 08h00:
 * - Se for Sábado ou Domingo: pula (clínica fechada)
 * - De Segunda a Quinta: dispara 48h (D+2)
 * - Na Sexta-feira: antecipa disparos de Segunda-feira (D+3) e Terça-feira (D+4)
 * - Executa cancelamento e repasse à lista de espera de consultas de HOJE (D+0) não confirmadas após o aviso de 24h
 */
export async function runMorningConfirmationDispatchAction(): Promise<{
  success: boolean;
  skipped?: boolean;
  message?: string;
  data?: any;
  error?: string;
}> {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 5 = Sexta, 6 = Sábado

    // Regra: Não opera sábado e domingo
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        success: true,
        skipped: true,
        message: "Fim de semana: a clínica não opera aos sábados e domingos. Disparos suspensos."
      };
    }

    const isFriday = dayOfWeek === 5;
    const upcoming = await fetchUpcomingBookingsAction(isFriday ? 4 : 2);
    if (!upcoming.success || !upcoming.data) {
      return { success: false, error: upcoming.error || "Falha ao buscar agendamentos." };
    }

    // Filtra candidatos para as 08h00:
    // Na sexta: D+2 (se houver), D+3 (Segunda) e D+4 (Terça)
    // De segunda a quinta: D+2 (48h)
    const candidates = upcoming.data.bookings.filter((b) => {
      if (b.isDispatched || !b.mobile) return false;
      if (isFriday) {
        return (b.dayOffset === 2 || b.dayOffset === 3 || b.dayOffset === 4) && b.suggestedScheduleTime === "08:00";
      } else {
        return b.dayOffset === 2 && b.suggestedScheduleTime === "08:00";
      }
    });

    const batchRes = await batchDispatchConfirmationsAction(candidates);

    // Processa também cancelamento e repasse para lista de espera das consultas de hoje não confirmadas
    const cancelRes = await cancelUnconfirmedAppointmentsAndNotifyWaitlistAction();

    return {
      success: true,
      data: {
        routine: "08h00_matinal",
        totalProcessed: candidates.length,
        dispatched: batchRes.dispatched,
        errors: batchRes.errors,
        cancellationsProcessed: cancelRes.cancelledCount || 0,
        waitlistNotifiedCount: cancelRes.waitlistNotifiedCount || 0,
      },
    };
  } catch (error: any) {
    console.error("[runMorningConfirmationDispatchAction] Erro:", error);
    return { success: false, error: "Falha ao executar rotina matinal das 08h00." };
  }
}

/**
 * Rotina automática das 14h00:
 * - Se for Sábado ou Domingo: pula
 * - Dispara para consultas de amanhã (D+1):
 *   - Se confirmada: envia 24H_LEMBRETE (lembrete passivo de presença)
 *   - Se pendente: envia 24H_AVISO (2º e último aviso com alerta de cancelamento)
 * - Na Sexta-feira: se houver consultas no Sábado (D+1), envia às 14h00
 */
export async function runAfternoonConfirmationDispatchAction(): Promise<{
  success: boolean;
  skipped?: boolean;
  message?: string;
  data?: any;
  error?: string;
}> {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        success: true,
        skipped: true,
        message: "Fim de semana: a clínica não opera aos sábados e domingos. Disparos suspensos."
      };
    }

    const upcoming = await fetchUpcomingBookingsAction(2);
    if (!upcoming.success || !upcoming.data) {
      return { success: false, error: upcoming.error || "Falha ao buscar agendamentos." };
    }

    // Candidatos das 14h00: agendamentos de amanhã (D+1) ainda não disparados no período da tarde
    const candidates = upcoming.data.bookings.filter(
      (b) => b.dayOffset === 1 && !b.isDispatched && b.mobile
    );

    const batchRes = await batchDispatchConfirmationsAction(candidates);

    return {
      success: true,
      data: {
        routine: "14h00_vespertina",
        totalProcessed: candidates.length,
        dispatched: batchRes.dispatched,
        errors: batchRes.errors,
      },
    };
  } catch (error: any) {
    console.error("[runAfternoonConfirmationDispatchAction] Erro:", error);
    return { success: false, error: "Falha ao executar rotina vespertina das 14h00." };
  }
}

/**
 * Cancela consultas de HOJE (D+0) que continuam sem confirmação após o aviso de 24h
 * e repassa automaticamente a vaga liberada para o próximo paciente da Lista de Espera.
 */
export async function cancelUnconfirmedAppointmentsAndNotifyWaitlistAction(): Promise<{
  success: boolean;
  cancelledCount: number;
  waitlistNotifiedCount: number;
  error?: string;
}> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Busca agendamentos de hoje na Clinic API
    const rawRes = await ClinicService.getDoctorBookings(
      DOCTOR_ID,
      ADDRESS_ID,
      todayStr,
      todayStr
    ).catch(() => ({ result: { items: [] } }));

    let items: any[] = [];
    if (Array.isArray(rawRes)) {
      items = rawRes;
    } else if (rawRes && typeof rawRes === "object") {
      items = rawRes.items || rawRes.result?.items || rawRes.data || [];
    }

    let cancelledCount = 0;
    let waitlistNotifiedCount = 0;

    for (const item of items) {
      const bookingId = String(item.id || "");
      if (!bookingId) continue;

      const confirmStatus = String(item.confirm || "").toLowerCase();
      // Se já está confirmado ou já foi atendido/cancelado, ignora
      if (
        confirmStatus.includes("confirmado") ||
        confirmStatus.includes("atendido") ||
        confirmStatus.includes("cancelado")
      ) {
        continue;
      }

      // Verifica se o paciente recebeu o 2º aviso de 24h
      const sentNotice = await (prisma as any).appointmentConfirmation.findFirst({
        where: {
          bookingId,
          notificationType: { in: ["24H", "24H_AVISO"] },
        },
      });

      // Se recebeu o aviso de 24h e ainda assim não confirmou:
      if (sentNotice && sentNotice.status !== "CONFIRMADO") {
        console.warn(`[Auto-Cancel] Agendamento não confirmado #${bookingId} de ${item.client}. Cancelamento automático suspenso por segurança (a cargo da recepção).`);
        // CANCELAMENTO AUTOMÁTICO DESATIVADO: apenas a recepção humana ou pedido expresso do paciente cancela na Clinic API.

        // B. Atualiza registro no banco
        await (prisma as any).appointmentConfirmation.updateMany({
          where: { bookingId },
          data: {
            status: "CANCELADO_INACAO",
            responseReceived: "Sem confirmação após 24h do último aviso. Vaga liberada para lista de espera."
          }
        });

        // C. Envia mensagem cordial avisando o paciente do cancelamento
        const rawPhone = String(item.mobile || item.phone || "");
        const { clean: phone } = normalizePhone(rawPhone);
        const rawClient = String(item.client || item.patient_name || "").trim();
        const patientName = toTitleCase(rawClient);
        const firstName = patientName.split(" ")[0];
        const rawHour = String(item.hour_schedule || item.hour || "");
        const hourSchedule = normalizeTime(rawHour);
        const { displayDate } = parseClinicDate(String(item.date_schedule || item.date || todayStr));

        if (phone) {
          const cancelMsg = buildCancellationDueToInactionMessage(firstName, displayDate, hourSchedule);
          try {
            const evoUrl = process.env.EVOLUTION_API_URL;
            const evoKey = process.env.EVOLUTION_API_KEY;
            const evoInst = process.env.EVOLUTION_INSTANCE || "henrique";
            if (evoUrl && evoKey) {
              await fetch(`${evoUrl}/message/sendText/${evoInst}`, {
                method: "POST",
                headers: { apikey: evoKey, "Content-Type": "application/json" },
                body: JSON.stringify({ number: phone, text: cancelMsg })
              });
            }
          } catch (msgErr: any) {
            console.error(`[Auto-Cancel] Falha ao enviar aviso de cancelamento para ${phone}:`, msgErr.message);
          }
        }

        cancelledCount++;

        // D. Cruza a vaga liberada com a lista de espera e dispara notificação para o melhor candidato
        const slotIso = `${todayStr}T${hourSchedule}:00`;
        try {
          const waitlistMatch = await matchWaitlistForSlotAction(DOCTOR_ID, ADDRESS_ID, slotIso);

          if (waitlistMatch.success && waitlistMatch.bestMatch) {
            const bestCandidate = waitlistMatch.bestMatch;
            console.log(`[Auto-Cancel] Vaga liberada ofertada para ${bestCandidate.patientName} (${bestCandidate.phone})`);
            await notifyWaitlistOfferAction(bestCandidate.id, slotIso);
            waitlistNotifiedCount++;
          }
        } catch (wlErr: any) {
          console.error(`[Auto-Cancel] Erro ao cruzar lista de espera:`, wlErr.message);
        }
      }
    }

    return {
      success: true,
      cancelledCount,
      waitlistNotifiedCount
    };
  } catch (error: any) {
    console.error("[cancelUnconfirmedAppointmentsAndNotifyWaitlistAction] Erro:", error);
    return { success: false, cancelledCount: 0, waitlistNotifiedCount: 0, error: error.message };
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

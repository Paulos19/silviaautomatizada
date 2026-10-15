"use server";

import prisma from "@/lib/prisma";
import { ClinicService } from "@/services/clinic.service";

const OFFICIAL_ADDRESS_TEXT = `📍 *Nosso endereço:*
Rua Dr. Roberto Barrozo, 1379
2º andar.
Hospital Otorrinos Curitiba
https://maps.google.com/?q=-25.415823,-49.282524`;

export interface ConfirmationDispatchResult {
  totalProcessed: number;
  sent48h: number;
  sent24h: number;
  alreadySent: number;
  errors: number;
  details: Array<{
    patientName: string;
    phone: string;
    doctorName: string;
    date: string;
    type: "48H" | "24H";
    status: "ENVIADO" | "JA_ENVIADO" | "ERRO";
  }>;
}

/**
 * Executa a rotina das 08h da manhã para disparos de confirmação de 48h e 24h.
 */
export async function runMorningConfirmationDispatchAction(): Promise<{
  success: boolean;
  data?: ConfirmationDispatchResult;
  error?: string;
}> {
  try {
    const now = new Date();

    // 24 horas à frente (D+1) e 48 horas à frente (D+2)
    const d1 = new Date(now);
    d1.setDate(d1.getDate() + 1);
    const d1Str = d1.toISOString().split("T")[0];

    const d2 = new Date(now);
    d2.setDate(d2.getDate() + 2);
    const d2Str = d2.toISOString().split("T")[0];

    // Busca médicos cadastrados para consultar a agenda de cada um
    const doctorsRes = await ClinicService.getDoctors().catch(() => ({ result: { items: [] } }));
    const doctors = doctorsRes.result?.items || [];

    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;
    const evoInst = process.env.EVOLUTION_INSTANCE || "henrique";

    const result: ConfirmationDispatchResult = {
      totalProcessed: 0,
      sent48h: 0,
      sent24h: 0,
      alreadySent: 0,
      errors: 0,
      details: [],
    };

    // Percorre datas D+1 (24h) e D+2 (48h)
    const targetDates = [
      { dateStr: d1Str, type: "24H" as const },
      { dateStr: d2Str, type: "48H" as const },
    ];

    for (const target of targetDates) {
      for (const doc of doctors) {
        try {
          const docId = String(doc.id);
          const addressId = "1"; // Unidade padrão Hospital Otorrinos Curitiba

          // Busca agendamentos do médico para essa data
          const bookingsRes = await ClinicService.getPatientBookings(
            docId,
            addressId,
            "",
            target.dateStr,
            target.dateStr
          ).catch(() => ({ result: { items: [] } }));

          const bookings = bookingsRes.result?.items || [];

          for (const b of bookings) {
            const item = b as any;
            result.totalProcessed++;
            const bookingId = String(item.id || item.booking_id || "");
            const patientName = String(item.patient_name || item.patient?.name || "Paciente");
            const rawPhone = String(item.patient_phone || item.patient?.mobile || item.patient?.phone || "");
            const cleanPhone = rawPhone.replace(/\D/g, "");

            if (!cleanPhone) {
              result.details.push({
                patientName,
                phone: rawPhone,
                doctorName: doc.name,
                date: target.dateStr,
                type: target.type,
                status: "ERRO",
              });
              result.errors++;
              continue;
            }

            // Checa se já enviamos este tipo de confirmação para este bookingId
            const alreadySent = await (prisma as any).appointmentConfirmation.findFirst({
              where: {
                bookingId,
                notificationType: target.type,
              },
            });

            if (alreadySent) {
              result.alreadySent++;
              result.details.push({
                patientName,
                phone: cleanPhone,
                doctorName: doc.name,
                date: target.dateStr,
                type: target.type,
                status: "JA_ENVIADO",
              });
              continue;
            }

            // Formatação humanizada da data e hora
            const rawDateValue = item.slot_start || item.date || target.dateStr;
            const apptDateObj = new Date(typeof rawDateValue === "string" ? rawDateValue : target.dateStr);
            const dateFmt = apptDateObj.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
            });
            const timeFmt = item.time || apptDateObj.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Mensagem fluida e conversacional (sem opções mecânicas '1' ou '2')
            const text = `Olá, ${patientName}! 👋 Tudo bem?

Passando para confirmar sua consulta com o(a) Dr(a). ${doc.name} no Hospital Otorrinos Curitiba.

📅 *Data:* ${dateFmt}
⏰ *Horário:* ${timeFmt}

${OFFICIAL_ADDRESS_TEXT}

Você confirma sua presença? Caso precise remarcar ou cancelar, basta me responder por aqui que te ajudo! 😊`;

            // Envia via WhatsApp (Evolution API)
            let sentSuccess = false;
            if (evoUrl && evoKey && evoInst) {
              try {
                const targetNumber = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
                const resp = await fetch(`${evoUrl}/message/sendText/${evoInst}`, {
                  method: "POST",
                  headers: {
                    apikey: evoKey,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    number: targetNumber,
                    text,
                  }),
                });
                sentSuccess = resp.ok;
              } catch (e: any) {
                console.error(`Erro ao disparar mensagem para ${cleanPhone}:`, e.message);
              }
            }

            // Registra no banco de dados para auditoria e evitar repetições
            await (prisma as any).appointmentConfirmation.create({
              data: {
                bookingId,
                patientName,
                phone: cleanPhone,
                doctorName: doc.name,
                appointmentDate: apptDateObj,
                notificationType: target.type,
                status: sentSuccess ? "ENVIADO" : "ERRO",
              },
            });

            if (sentSuccess) {
              if (target.type === "48H") result.sent48h++;
              else result.sent24h++;

              result.details.push({
                patientName,
                phone: cleanPhone,
                doctorName: doc.name,
                date: target.dateStr,
                type: target.type,
                status: "ENVIADO",
              });
            } else {
              result.errors++;
              result.details.push({
                patientName,
                phone: cleanPhone,
                doctorName: doc.name,
                date: target.dateStr,
                type: target.type,
                status: "ERRO",
              });
            }
          }
        } catch (docErr: any) {
          console.warn(`Erro ao consultar agenda do médico ${doc.name}:`, docErr.message);
        }
      }
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Erro na rotina de disparos das 08h:", error);
    return { success: false, error: "Falha ao executar rotina de confirmação matinal." };
  }
}

/**
 * Consulta o histórico recente de confirmações enviadas.
 */
export async function fetchConfirmationHistoryAction() {
  try {
    const list = await (prisma as any).appointmentConfirmation.findMany({
      orderBy: { sentAt: "desc" },
      take: 50,
    });
    return { success: true, data: list };
  } catch (error: any) {
    console.error("Erro ao carregar histórico de confirmações:", error);
    return { success: false, error: "Falha ao carregar histórico." };
  }
}

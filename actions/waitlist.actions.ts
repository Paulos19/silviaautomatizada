"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface WaitlistFilterParams {
  doctorId?: string;
  priority?: number;
  status?: string;
  searchTerm?: string;
}

export async function fetchWaitlistAction(params?: WaitlistFilterParams) {
  try {
    const where: any = {};

    if (params?.status && params.status !== "ALL") {
      where.status = params.status;
    }

    if (params?.doctorId && params.doctorId !== "ALL") {
      where.doctorId = params.doctorId;
    }

    if (params?.priority && params.priority > 0) {
      where.priority = params.priority;
    }

    if (params?.searchTerm && params.searchTerm.trim() !== "") {
      const term = params.searchTerm.trim();
      where.OR = [
        { patientName: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
        { nin: { contains: term } },
        { doctorName: { contains: term, mode: "insensitive" } },
      ];
    }

    // Rankeamento: Maior prioridade primeiro (3: Urgente, 2: Alta, 1: Normal),
    // e quem está há mais tempo esperando (createdAt: asc)
    const rawEntries = await (prisma as any).waitlistEntry.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    // Atribui o ranking numérico ordinal (#1, #2, #3...)
    const ranked = rawEntries.map((item: any, index: number) => ({
      ...item,
      ranking: index + 1,
    }));

    return { success: true, data: ranked };
  } catch (error: any) {
    console.error("Erro ao buscar lista de espera:", error);
    return { success: false, error: "Falha ao carregar lista de espera." };
  }
}

export async function createWaitlistEntryAction(data: {
  patientName: string;
  phone: string;
  nin?: string;
  birthDate?: string;
  doctorId?: string;
  doctorName?: string;
  addressId?: string;
  currentBookingId?: string;
  currentBookingDate?: string | Date;
  requestedBeforeDate?: string | Date;
  preferredPeriod?: string;
  preferredDays?: string;
  priority?: number;
  priorityReason?: string;
  notes?: string;
}) {
  try {
    const cleanPhone = (data.phone || "").replace(/\D/g, "");
    if (!cleanPhone || !data.patientName) {
      return { success: false, error: "Nome do paciente e telefone são obrigatórios." };
    }

    // Normaliza datas se fornecidas
    const currentBookingDate = data.currentBookingDate ? new Date(data.currentBookingDate) : null;
    const requestedBeforeDate = data.requestedBeforeDate ? new Date(data.requestedBeforeDate) : null;

    // Checa se o paciente já está ativo na fila de espera
    const existing = await (prisma as any).waitlistEntry.findFirst({
      where: {
        phone: cleanPhone,
        status: "AGUARDANDO",
        ...(data.doctorId ? { doctorId: data.doctorId } : {}),
      },
    });

    if (existing) {
      // Atualiza a solicitação existente para evitar cards duplicados na lista
      const updated = await (prisma as any).waitlistEntry.update({
        where: { id: existing.id },
        data: {
          patientName: data.patientName.trim(),
          nin: data.nin?.trim() || existing.nin,
          doctorName: data.doctorName?.trim() || existing.doctorName,
          currentBookingDate: currentBookingDate || existing.currentBookingDate,
          requestedBeforeDate: requestedBeforeDate || existing.requestedBeforeDate,
          preferredPeriod: data.preferredPeriod || existing.preferredPeriod,
          preferredDays: data.preferredDays || existing.preferredDays,
          priority: typeof data.priority === "number" ? data.priority : existing.priority,
          priorityReason: data.priorityReason?.trim() || existing.priorityReason,
          notes: data.notes?.trim() || existing.notes,
        },
      });
      revalidatePath("/dashboard/waitlist");
      return { success: true, data: updated, isUpdate: true };
    }

    const created = await (prisma as any).waitlistEntry.create({
      data: {
        patientName: data.patientName.trim(),
        phone: cleanPhone,
        nin: data.nin?.trim() || null,
        birthDate: data.birthDate?.trim() || null,
        doctorId: data.doctorId || null,
        doctorName: data.doctorName?.trim() || null,
        addressId: data.addressId || "1",
        currentBookingId: data.currentBookingId || null,
        currentBookingDate,
        requestedBeforeDate,
        preferredPeriod: data.preferredPeriod || "QUALQUER",
        preferredDays: data.preferredDays || "QUALQUER",
        priority: typeof data.priority === "number" ? data.priority : 1,
        priorityReason: data.priorityReason?.trim() || null,
        notes: data.notes?.trim() || null,
        status: "AGUARDANDO",
      },
    });

    revalidatePath("/dashboard/waitlist");
    return { success: true, data: created, isUpdate: false };
  } catch (error: any) {
    console.error("Erro ao adicionar paciente na lista de espera:", error);
    return { success: false, error: "Falha ao salvar paciente na fila de espera." };
  }
}

export async function updateWaitlistPriorityAction(
  id: string,
  priority: number,
  priorityReason?: string
) {
  try {
    const updated = await (prisma as any).waitlistEntry.update({
      where: { id },
      data: {
        priority,
        ...(priorityReason ? { priorityReason } : {}),
      },
    });
    revalidatePath("/dashboard/waitlist");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Erro ao atualizar prioridade:", error);
    return { success: false, error: "Falha ao atualizar prioridade." };
  }
}

export async function updateWaitlistStatusAction(
  id: string,
  status: string,
  notes?: string
) {
  try {
    const data: any = { status };
    if (notes !== undefined) data.notes = notes;

    const updated = await (prisma as any).waitlistEntry.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/waitlist");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Erro ao atualizar status da fila de espera:", error);
    return { success: false, error: "Falha ao atualizar status." };
  }
}

export async function deleteWaitlistEntryAction(id: string) {
  try {
    const deleted = await (prisma as any).waitlistEntry.delete({
      where: { id },
    });
    revalidatePath("/dashboard/waitlist");
    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("Erro ao remover da lista de espera:", error);
    return { success: false, error: "Falha ao excluir item da lista de espera." };
  }
}

/**
 * Encontra o melhor candidato na lista de espera para uma vaga desocupada (desistência/cancelamento).
 * REGRA ESSENCIAL: O horário novo DEVE ser anterior à data que o paciente já tem agendada.
 */
export async function matchWaitlistForSlotAction(
  doctorId: string,
  addressId: string,
  slotStartStr: string
) {
  try {
    const slotDate = new Date(slotStartStr);
    const slotHour = slotDate.getHours();
    const period = slotHour < 12 ? "MANHA" : "TARDE";

    // Busca pacientes aguardando para este médico/unidade
    const candidates = await (prisma as any).waitlistEntry.findMany({
      where: {
        status: "AGUARDANDO",
        OR: [
          { doctorId: doctorId },
          { doctorId: null },
        ],
        AND: [
          {
            OR: [
              { addressId: addressId },
              { addressId: null },
            ],
          },
          {
            OR: [
              { preferredPeriod: "QUALQUER" },
              { preferredPeriod: period },
              { preferredPeriod: null },
            ],
          },
        ],
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    // Filtra aplicando estritamente as regras de data solicitadas pelo usuário:
    // 1. O horário disponível DEVE ser ANTERIOR à data que ele já tem agendada (se tiver uma)
    // 2. O horário deve ser antes do requestedBeforeDate (se especificado)
    const validMatches = candidates.filter((entry: any) => {
      if (entry.currentBookingDate) {
        const currentDate = new Date(entry.currentBookingDate);
        if (slotDate >= currentDate) {
          // Não envia horários que já estavam disponíveis à frente da data que ele tem
          return false;
        }
      }

      if (entry.requestedBeforeDate) {
        const maxDate = new Date(entry.requestedBeforeDate);
        if (slotDate > maxDate) {
          return false;
        }
      }

      return true;
    });

    return {
      success: true,
      totalCandidates: candidates.length,
      matchedCandidates: validMatches,
      bestMatch: validMatches[0] || null,
    };
  } catch (error: any) {
    console.error("Erro ao cruzar vaga com lista de espera:", error);
    return { success: false, error: "Falha ao cruzar vaga com fila." };
  }
}

/**
 * Notifica o paciente via WhatsApp sobre a vaga antecipada decorrente de desistência.
 */
export async function notifyWaitlistOfferAction(entryId: string, slotDateStr: string) {
  try {
    const entry = await (prisma as any).waitlistEntry.findUnique({ where: { id: entryId } });
    if (!entry) return { success: false, error: "Registro não encontrado." };

    const slotDate = new Date(slotDateStr);
    const dateFormatted = slotDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeFormatted = slotDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const doctorName = entry.doctorName ? `o(a) Dr(a). ${entry.doctorName}` : "seu médico";

    // Mensagem humanizada e conversacional (sem pedir 1 ou 2)
    const message = `Olá, ${entry.patientName}! 👋 Sou a Silvia do Hospital Otorrinos Curitiba.

Surgiu uma vaga antecipada com ${doctorName} para *${dateFormatted} às ${timeFormatted}* devido a uma desistência recente.

📍 *Nosso endereço:*
Rua Dr. Roberto Barrozo, 1379
2º andar.
Hospital Otorrinos Curitiba
https://maps.google.com/?q=-25.415823,-49.282524

Gostaria de antecipar sua consulta para este horário? Basta me responder por aqui que organizo tudo para você! 😊`;

    // Dispara via Evolution API se configurada
    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;
    const evoInst = process.env.EVOLUTION_INSTANCE || "henrique";

    if (evoUrl && evoKey && evoInst) {
      try {
        const cleanNumber = entry.phone.startsWith("55") ? entry.phone : `55${entry.phone}`;
        await fetch(`${evoUrl}/message/sendText/${evoInst}`, {
          method: "POST",
          headers: {
            apikey: evoKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: cleanNumber,
            text: message,
          }),
        });
      } catch (err: any) {
        console.warn("Falha ao enviar mensagem Evolution API:", err.message);
      }
    }

    // Atualiza status para OFERTADO
    const updated = await (prisma as any).waitlistEntry.update({
      where: { id: entryId },
      data: {
        status: "OFERTADO",
        offeredSlot: slotDate,
        offeredAt: new Date(),
      },
    });

    revalidatePath("/dashboard/waitlist");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Erro ao notificar vaga:", error);
    return { success: false, error: "Falha ao notificar paciente." };
  }
}

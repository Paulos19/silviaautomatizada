"use server";

import prisma from "@/lib/prisma";
import { ClinicService } from "@/services/clinic.service";

// --- Actions de Listagem ---
export async function fetchPatientsAction(nin?: string) {
  try {
    const response = await ClinicService.getPatients(nin);
    return { success: true, data: response.result.items || [] };
  } catch (error) {
    console.error("[Clinic API Error] fetchPatients:", error);
    return { success: false, error: "Falha ao buscar pacientes da Clinic API." };
  }
}

export async function fetchDoctorsAction() {
  try {
    const response = await ClinicService.getDoctors();
    return { success: true, data: response.result.items || [] };
  } catch (error) {
    console.error("[Clinic API Error] fetchDoctors:", error);
    return { success: false, error: "Falha ao buscar médicos da Clinic API." };
  }
}

export async function fetchInsuranceProvidersAction() {
  try {
    const response = await ClinicService.getInsuranceProviders();
    return { success: true, data: response.result.items || [] };
  } catch (error) {
    console.error("[Clinic API Error] fetchInsuranceProviders:", error);
    return { success: false, error: "Falha ao buscar convênios da Clinic API." };
  }
}

// --- Actions Individuais ---
export async function fetchSingleDoctorAction(doctorId: string) {
  if (!doctorId) return { success: false, error: "ID obrigatório." };
  try {
    const response = await ClinicService.getDoctorById(doctorId);
    return { success: true, data: response.result };
  } catch (error) {
    return { success: false, error: "Falha ao buscar médico." };
  }
}

export async function fetchSinglePatientAction(patientId: string) {
  if (!patientId) return { success: false, error: "ID obrigatório." };
  try {
    const response = await ClinicService.getPatientById(patientId);
    return { success: true, data: response.result };
  } catch (error) {
    return { success: false, error: "Falha ao buscar paciente." };
  }
}

export async function checkPatientExistsAction(nin: string, birthday?: string) {
  if (!nin) return { success: false, error: "NIN/CPF obrigatório." };

  try {
    const cleanNin = nin.replace(/\D/g, "");
    if (!cleanNin) return { success: false, error: "CPF inválido." };

    // 1. Busca Básica para ver se o paciente existe (sempre dígitos limpos)
    const response = await ClinicService.getPatients(cleanNin, 1, 100);
    const items = response.result?.items;

    if (items && items.length > 0) {
      const patient = items[0];

      // 2. BUSCA COMPLETA (Anti-Alucinação)
      // Tenta pegar o perfil completo para extrair o healthInsuranceCode
      try {
        const fullProfileResponse = await ClinicService.getPatientById(patient.id);

        // Dependendo de como o seu Zod schema mapeia, os dados podem vir direto no objeto ou dentro de um '.result'
        const fullPatient = fullProfileResponse.result || fullProfileResponse;

        return {
          success: true,
          data: {
            patient_id: patient.id,
            patient_name: patient.name,
            patient_mobile: patient.mobile,
            patient_email: patient.email,
            // INJETANDO DADOS PARA A IA:
            // Tenta mapear os nomes mais comuns que a API da clínica possa usar para o convênio
            healthInsuranceCode: fullPatient.healthInsuranceCode || fullPatient.insurance_id || fullPatient.healthInsurancePlan || null,
            maritalStatus: fullPatient.maritalStatus || patient.maritalStatus || null,
            sex: fullPatient.sex || patient.sex || null
          }
        };

      } catch (fullProfileError) {
        // Fallback: Se a busca do perfil completo falhar (API lenta/caiu), 
        // devolve o básico para a IA continuar o fluxo sem o convênio (e ela chamará a Tool_Listar_Convenios).
        console.error("[Clinic API Error] Erro ao buscar perfil completo, retornando básico:", fullProfileError);
        return {
          success: true,
          data: {
            patient_id: patient.id,
            patient_name: patient.name,
            patient_mobile: patient.mobile,
            patient_email: patient.email
          }
        };
      }
    }

    // Se o array de items vier vazio, paciente não existe
    return { success: false, error: "Paciente não encontrado." };

  } catch (error) {
    console.error("[Clinic API Error] checkPatientExistsAction:", error);
    return { success: false, error: "Falha ao verificar existência." };
  }
}

// --- Actions de Agendamento e Criação ---
export async function createPatientAction(payload: Record<string, any>) {
  try {
    // 1. Limpeza de Celular (Já estava no seu código)
    if (payload.mobile && typeof payload.mobile === 'string') {
      let cleanMobile = payload.mobile.replace(/\D/g, '');
      if (cleanMobile.startsWith('55') && cleanMobile.length === 13) {
        cleanMobile = cleanMobile.substring(2);
      }
      payload.mobile = cleanMobile.substring(0, 11);
    }

    // 2. Limpeza de CPF (Já estava no seu código)
    if (payload.nin && typeof payload.nin === 'string') {
      payload.nin = payload.nin.replace(/\D/g, '');
    }

    // 3. Tratamento de Data de Nascimento (Garante o formato YYYY-MM-DD)
    if (payload.birthday && payload.birthday.includes('/')) {
      const [day, month, year] = payload.birthday.split('/');
      // Converte DD/MM/YYYY para YYYY-MM-DD
      if (day && month && year) {
        payload.birthday = `${year}-${month}-${day}`;
      }
    }

    // 4. Tratamento do Convênio e Carteirinha (Atualizado)
    // O n8n agora envia diretamente a chave "registration" quando o paciente pede para atualizar.
    // A API Legacy receberá o campo "registration" nativamente no payload e deverá salvá-lo.

    // Caso a API da clínica exija que esse número vá mapeado em outro campo na hora do POST 
    // (por exemplo, dentro de healthInsurancePlan), você pode descomentar o bloco abaixo:
    /*
    if (payload.registration) {
      payload.healthInsurancePlan = payload.registration;
      // delete payload.registration; // Descomente apenas se a API der erro com 'registration'
    }
    */

    // 5. Garantia de campo obrigatório external_id (Exigido estritamente pela API da Clínica)
    payload.external_id = payload.external_id !== undefined && payload.external_id !== null ? String(payload.external_id) : "";

    // 6. Conversão de código do convênio para numérico se presente
    if (payload.healthInsuranceCode && typeof payload.healthInsuranceCode === 'string') {
      const parsedCode = parseInt(payload.healthInsuranceCode, 10);
      if (!isNaN(parsedCode)) {
        payload.healthInsuranceCode = parsedCode;
      }
    }

    const response = await ClinicService.createOrUpdatePatient(payload);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("[Clinic API Error] createPatient:", error.message);
    return { success: false, error: error.message || "Falha ao criar/atualizar paciente." };
  }
}

export async function fetchFreeSlotsAction(doctorId: string, addressId: string, startDate: string, endDate: string) {
  if (!doctorId || !addressId || !startDate || !endDate) return { success: false, error: "Parâmetros incompletos." };

  try {
    const response = await ClinicService.getFreeSlots(doctorId, addressId, startDate, endDate);
    let slots = response.result.items || [];

    // 1. Opcional, mas recomendado: Garantir que estão em ordem cronológica
    // slots.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // 2. CORTE AJUSTADO: 30 horários garantem bons dias de agenda 
    // sem estourar a janela de contexto (tokens) da IA.
    const limitedSlots = slots.slice(0, 30);

    return { success: true, data: limitedSlots };
  } catch (error: any) {
    console.error("[Clinic API Error] getFreeSlots:", error.message);
    return { success: false, error: "Falha ao buscar horários livres." };
  }
}

export async function bookSlotAction(doctorId: string, addressId: string, slotStart: string, payload: Record<string, any>) {
  try {
    const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "10073";
    const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "1";

    // Mapeamento e normalização dos campos exigidos pela Clinic API
    let healthInsuranceCode = 
      payload.healthInsuranceCode ?? 
      payload.health_insurance_id ?? 
      payload.healthInsuranceId ?? 
      payload.health_insurance_code;

    // Se ainda não tiver código do convênio e temos o patient_id, busca no cadastro do paciente
    if (!healthInsuranceCode && payload.patient_id) {
      try {
        const patientData = await ClinicService.getPatientById(payload.patient_id);
        healthInsuranceCode = patientData.result?.healthInsuranceCode;
      } catch (e: any) {
        console.warn("[bookSlotAction] Falha ao recuperar convênio do paciente:", e.message);
      }
    }

    // Fallback padrão para Unimed (260) se não identificado
    if (!healthInsuranceCode || Number(healthInsuranceCode) === 0) {
      healthInsuranceCode = 260;
    }

    const cleanPayload = {
      address_service_id: payload.address_service_id || 1,
      external_id: payload.external_id || "1",
      patient_id: Number(payload.patient_id),
      obs: payload.obs || payload.note || payload.observacoes || "Agendado via Silv.IA",
      healthInsuranceCode: Number(healthInsuranceCode),
      consultationType: payload.consultationType || 1,
      appointmentType: payload.appointmentType || payload.type || 1,
    };

    const response = await ClinicService.bookSlot(finalDoctorId, finalAddressId, slotStart, cleanPayload);
    return { success: true, data: response.result };
  } catch (error: any) {
    console.error("[Clinic API Error] bookSlot:", error.message);
    return { success: false, error: "Falha ao agendar consulta: " + error.message };
  }
}

export async function cancelBookingAction(doctorId?: string, addressId?: string, bookingId?: string, externalId: string = "1") {
  const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "10073";
  const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "1";

  if (!bookingId) return { success: false, error: "ID do agendamento (bookingId) é obrigatório." };

  try {
    const response = await ClinicService.cancelBooking(finalDoctorId, finalAddressId, bookingId, externalId);
    return { success: true, data: response || "Agendamento cancelado com sucesso." };
  } catch (error: any) {
    console.error("[Clinic API Error] cancelBooking:", error.message);
    return { success: false, error: "Falha ao cancelar agendamento." };
  }
}

export async function setBookingConfirmationAction(
  doctorId?: string,
  addressId?: string,
  bookingId?: string,
  status: "confirmed" | "pending" = "confirmed"
) {
  const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "10073";
  const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "1";

  if (!bookingId) return { success: false, error: "ID do agendamento (bookingId) é obrigatório." };

  try {
    const response = await ClinicService.setBookingConfirmation(finalDoctorId, finalAddressId, bookingId, status);
    return { success: true, data: response || "Status de confirmação atualizado." };
  } catch (error: any) {
    console.error("[Clinic API Error] setBookingConfirmation:", error.message);
    return { success: false, error: "Falha ao atualizar confirmação do agendamento." };
  }
}

export async function fetchDoctorBookingsAction(
  doctorId?: string,
  addressId?: string,
  startDate?: string,
  endDate?: string,
  filters: Record<string, string> = {}
) {
  const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "10073";
  const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "1";
  const todayStr = new Date().toISOString().split("T")[0];
  const finalStartDate = startDate || todayStr;
  const finalEndDate = endDate || finalStartDate;

  try {
    const response = await ClinicService.getDoctorBookings(finalDoctorId, finalAddressId, finalStartDate, finalEndDate, filters);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("[Clinic API Error] fetchDoctorBookings:", error.message);
    return { success: false, error: "Falha ao buscar agendamentos do médico." };
  }
}

export async function fetchPatientBookingsAction(doctorId: string, addressId: string, patientId: string, startDate: string, endDate: string) {
  try {
    const response = await ClinicService.getPatientBookings(doctorId, addressId, patientId, startDate, endDate);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("[Clinic API Error] getPatientBookings:", error.message);
    return { success: false, error: "Falha ao buscar agendamentos." };
  }
}

export async function fetchBookingsByNINAction(nin: string, birthday?: string, doctorId?: string, addressId?: string) {
  if (!nin) return { success: false, error: "CPF/NIN é obrigatório." };
  try {
    const cleanNin = nin.replace(/\D/g, "");
    // Passo 1: Descobrir o patientId pelo CPF
    const patientsResponse = await ClinicService.getPatients(cleanNin, 1, 100);
    const items = patientsResponse.result?.items;

    if (!items || items.length === 0) {
      return { success: false, error: "Paciente não encontrado com esse CPF." };
    }

    const patientId = String(items[0].id);

    // Passo 2: Buscar agendamentos usando o endpoint da agenda (30 dias atrás até 365 dias no futuro)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const startDate = pastDate.toISOString().split('T')[0];

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 365);
    const endDate = futureDate.toISOString().split('T')[0];

    const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "10073";
    const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "1";

    const response = await ClinicService.getPatientBookings(
      finalDoctorId,
      finalAddressId,
      patientId,
      startDate,
      endDate
    );

    return { success: true, data: response };
  } catch (error: any) {
    console.error("[Clinic API Error] fetchBookingsByNINAction:", error.message);
    return { success: false, error: "Falha ao buscar agendamentos por CPF/NIN." };
  }
}

export async function fetchBookingByIdAction(doctorId: string, addressId: string, bookingId: string) {
  if (!doctorId || !addressId || !bookingId) return { success: false, error: "Parâmetros incompletos." };
  try {
    const response = await ClinicService.getBookingById(doctorId, addressId, bookingId);
    return { success: true, data: response.result };
  } catch (error: any) {
    console.error("[Clinic API Error] fetchBookingByIdAction:", error.message);
    return { success: false, error: "Falha ao buscar detalhes do agendamento." };
  }
}

export async function createPrescriptionRequestAction(data: {
  patientName: string;
  birthDate: string;
  unimedCard: string;
  address: string;
  medications: string;
  passarCarteirinha?: boolean;
}) {
  try {
    const rawName = (data.patientName || "").trim();
    const rawCard = (data.unimedCard || "").replace(/\s+/g, "");

    // Busca se já existe uma solicitação PENDENTE recente deste mesmo paciente (últimas 48h)
    // para evitar que mensagens sequenciais no WhatsApp multipliquem os cards
    let existing = null;

    if (rawName || rawCard) {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      existing = await prisma.prescriptionRequest.findFirst({
        where: {
          status: "PENDENTE",
          createdAt: { gte: fortyEightHoursAgo },
          OR: [
            ...(rawName ? [{ patientName: { equals: rawName, mode: "insensitive" as const } }] : []),
            ...(rawCard ? [{ unimedCard: { contains: rawCard } }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (existing) {
      // Atualiza a solicitação pendente existente com as informações mais recentes/completas
      const updated = await prisma.prescriptionRequest.update({
        where: { id: existing.id },
        data: {
          patientName: rawName || existing.patientName,
          birthDate: data.birthDate?.trim() || existing.birthDate,
          unimedCard: (data.unimedCard?.trim() || existing.unimedCard).replace(/\s+/g, ""),
          address: data.address?.trim() || existing.address,
          medications: data.medications?.trim() || existing.medications,
          ...(typeof data.passarCarteirinha === "boolean" ? { passarCarteirinha: data.passarCarteirinha } : {}),
        },
      });
      return { success: true, data: updated, isUpdate: true };
    }

    const request = await prisma.prescriptionRequest.create({
      data: {
        patientName: rawName || "Paciente sem nome",
        birthDate: data.birthDate?.trim() || "",
        unimedCard: (data.unimedCard || "").replace(/\s+/g, ""),
        address: data.address?.trim() || "",
        medications: data.medications?.trim() || "",
        passarCarteirinha: Boolean(data.passarCarteirinha),
      },
    });
    return { success: true, data: request, isUpdate: false };
  } catch (error: any) {
    console.error("Erro ao criar ou atualizar solicitação de receita:", error);
    return { success: false, error: "Falha ao salvar a solicitação de receita." };
  }
}

export async function togglePassarCarteirinhaAction(id: string, passarCarteirinha: boolean) {
  try {
    const updated = await prisma.prescriptionRequest.update({
      where: { id },
      data: { passarCarteirinha },
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Erro ao alternar tag Passar Carteirinha:", error);
    return { success: false, error: "Falha ao alternar tag Passar Carteirinha." };
  }
}

export async function fetchPrescriptionRequestsAction() {
  try {
    const requests = await prisma.prescriptionRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: requests };
  } catch (error: any) {
    console.error("Erro ao buscar solicitações de receita:", error);
    return { success: false, error: "Falha ao buscar solicitações." };
  }
}

export async function updatePrescriptionStatusAction(id: string, status: string) {
  try {
    const updated = await prisma.prescriptionRequest.update({
      where: { id },
      data: { status },
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Erro ao atualizar status da receita:", error);
    return { success: false, error: "Falha ao atualizar status." };
  }
}

export async function deletePrescriptionRequestAction(id: string) {
  try {
    const deleted = await prisma.prescriptionRequest.delete({
      where: { id },
    });
    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("Erro ao deletar solicitação de receita:", error);
    return { success: false, error: "Falha ao deletar solicitação de receita." };
  }
}

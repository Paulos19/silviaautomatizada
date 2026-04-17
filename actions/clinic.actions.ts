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

export async function checkPatientExistsAction(nin: string, birthday: string) {
  if (!nin) return { success: false, error: "NIN/CPF obrigatório." };
  try {
    const response = await ClinicService.getPatients(nin, 1, 100);
    const items = response.result?.items;

    if (items && items.length > 0) {
      const patient = items[0];
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

    // Removemos resquícios do 'cardNumber' antigo para garantir que não quebre a API
    // caso a IA acabe enviando esse campo por engano devido ao histórico.
    if (payload.cardNumber) {
      delete payload.cardNumber;
    }

    const response = await ClinicService.createOrUpdatePatient(payload);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("[Clinic API Error] createPatient:", error.message);
    return { success: false, error: "Falha ao criar/atualizar paciente." };
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
    if (payload.external_id === "") {
      delete payload.external_id;
    }

    const response = await ClinicService.bookSlot(doctorId, addressId, slotStart, payload);
    return { success: true, data: response.result };
  } catch (error: any) {
    console.error("[Clinic API Error] bookSlot:", error.message);
    return { success: false, error: "Falha ao agendar consulta." };
  }
}

export async function cancelBookingAction(doctorId: string, addressId: string, bookingId: string, externalId: string = "1") {
  if (!doctorId || !addressId || !bookingId) return { success: false, error: "Parâmetros incompletos." };

  try {
    const response = await ClinicService.cancelBooking(doctorId, addressId, bookingId, externalId);
    return { success: true, data: "Agendamento cancelado com sucesso (204 No Content)." };
  } catch (error: any) {
    console.error("[Clinic API Error] cancelBooking:", error.message);
    return { success: false, error: "Falha ao cancelar agendamento." };
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

export async function fetchBookingsByNINAction(nin: string, birthday: string, doctorId: string) {
  if (!nin || !birthday || !doctorId) return { success: false, error: "CPF, Data e ID do Médico são obrigatórios." };

  try {
    // 1. Limpeza de dados recebidos do WhatsApp (n8n)
    const cleanNin = nin.replace(/\D/g, '');

    let cleanBirthday = birthday;
    if (cleanBirthday.includes('/')) {
      const [day, month, year] = cleanBirthday.split('/');
      if (day && month && year) cleanBirthday = `${year}-${month}-${day}`;
    }

    // 2. Consulta em TEMPO REAL na API DO CLINIC para descobrir o patient_id
    const existsRes = await ClinicService.checkPatientExists(cleanNin, cleanBirthday);

    // Se a clínica disser que o paciente não existe, abortamos e avisamos a IA
    if (!existsRes.result || !existsRes.result.patient_id) {
      return { success: false, error: "Paciente não encontrado no sistema da clínica com este CPF e Data de Nascimento." };
    }

    const patientId = existsRes.result.patient_id.toString();

    // 3. Monta a janela de datas (Hoje até 90 dias para frente)
    const today = new Date();
    const start_date = today.toISOString().split('T')[0];

    const end = new Date();
    end.setDate(end.getDate() + 90);
    const end_date = end.toISOString().split('T')[0];

    // 4. Busca os agendamentos usando a rota que exige o patient_id
    const bookingsRes = await ClinicService.getPatientBookings(doctorId, "1", patientId, start_date, end_date);
    const bookings = bookingsRes.result?.items || [];

    // 5. Injeta o aviso (Anti-Alucinação) para a IA caso a lista venha vazia
    if (bookings.length === 0) {
      return {
        success: true,
        data: [],
        _aviso_sistema: `ATENÇÃO IA: O paciente foi encontrado no sistema (ID: ${patientId}), mas NÃO há consultas agendadas para ele nos próximos 90 dias com este médico. Envie uma mensagem simpática avisando isso e pergunte qual foi o dia/mês aproximado que ele agendou para pesquisarmos novamente.`
      };
    }

    // Se tem agendamento, retorna normalmente
    return { success: true, data: bookings };

  } catch (error: any) {
    console.error("[Clinic API Error] fetchBookingsByNINAction:", error);
    return { success: false, error: "Falha interna ao comunicar com a API da clínica." };
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
}) {
  try {
    const request = await prisma.prescriptionRequest.create({
      data: {
        patientName: data.patientName,
        birthDate: data.birthDate,
        unimedCard: data.unimedCard,
        address: data.address,
        medications: data.medications,
      }
    });
    return { success: true, data: request };
  } catch (error: any) {
    console.error("Erro ao criar solicitação de receita:", error);
    return { success: false, error: "Falha ao salvar a solicitação de receita." };
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
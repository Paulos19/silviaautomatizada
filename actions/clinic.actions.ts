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
    // 1. Limpeza de Celular
    if (payload.mobile && typeof payload.mobile === 'string') {
      let cleanMobile = payload.mobile.replace(/\D/g, '');
      if (cleanMobile.startsWith('55') && cleanMobile.length === 13) {
        cleanMobile = cleanMobile.substring(2);
      }
      payload.mobile = cleanMobile.substring(0, 11);
    }

    // 2. Limpeza de CPF
    if (payload.nin && typeof payload.nin === 'string') {
      payload.nin = payload.nin.replace(/\D/g, '');
    }

    // 3. Tratamento de Data de Nascimento (Garante YYYY-MM-DD)
    if (payload.birthday && payload.birthday.includes('/')) {
      const [day, month, year] = payload.birthday.split('/');
      if (day && month && year) {
        payload.birthday = `${year}-${month}-${day}`;
      }
    }

    // Limpeza de campos legados que quebram a API
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

    // Limite de 30 horários para proteger a janela de contexto da IA
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
  // 1. Validação estrita
  if (!doctorId || !addressId || !patientId || !startDate || !endDate) {
    return { success: false, error: "Parâmetros incompletos. doctorId, addressId, patientId, startDate e endDate são obrigatórios." };
  }

  try {
    // 2. Chama a API da clínica
    const response = await ClinicService.getPatientBookings(doctorId, addressId, patientId, startDate, endDate);
    const bookings = response.result?.items || [];

    // 3. Fallback inteligente (Anti-alucinação)
    if (bookings.length === 0) {
      return {
        success: true,
        data: [],
        _aviso_sistema: "ATENÇÃO IA: A busca foi realizada com sucesso, mas NÃO existem agendamentos para este paciente neste período. Informe isso ao paciente de forma amigável."
      };
    }

    return { success: true, data: bookings };

  } catch (error: any) {
    console.error("[Clinic API Error] fetchPatientBookingsAction:", error);
    return {
      success: false,
      error: `Erro na busca de agendamentos: ${error.message}`
    };
  }
}

// 🔥 A ACTION BLINDADA DE BUSCA POR CPF
export async function fetchBookingsByNINAction(nin: string, birthday: string, doctorId: string, addressId: string) {
  // 1. Validação incluindo o addressId agora
  if (!nin || !birthday || !doctorId || !addressId) {
    return { success: false, error: "CPF, Data, ID do Médico e ID do Endereço são obrigatórios." };
  }

  try {
    const cleanNin = nin.replace(/\D/g, '');

    let cleanBirthday = birthday;
    if (cleanBirthday.includes('/')) {
      const [day, month, year] = cleanBirthday.split('/');
      if (day && month && year) cleanBirthday = `${year}-${month}-${day}`;
    }

    // 2. Buscar o ID do paciente (como você validou ser necessário)
    const patientRes = await ClinicService.getPatients(cleanNin, 1, 10);
    const patientItems = patientRes.result?.items || [];

    if (patientItems.length === 0) {
      return { success: false, error: "Paciente não encontrado no sistema da clínica com este CPF." };
    }

    const patientId = patientItems[0].id.toString();

    // 3. Montar janela de 90 dias
    const today = new Date();
    const start_date = today.toISOString().split('T')[0];

    const end = new Date();
    end.setDate(end.getDate() + 90);
    const end_date = end.toISOString().split('T')[0];

    // 4. A BUSCA CORRIGIDA: Agora usamos o 'addressId' dinâmico em vez de "1"
    const bookingsRes = await ClinicService.getPatientBookings(doctorId, addressId, patientId, start_date, end_date);
    const bookings = bookingsRes.result?.items || [];

    // 5. Tratamento para a IA
    if (bookings.length === 0) {
      return {
        success: true,
        data: [],
        _aviso_sistema: `ATENÇÃO IA: O paciente foi encontrado (ID: ${patientId}), mas NÃO há consultas nos próximos 90 dias neste médico/endereço. Avise educadamente e pergunte qual foi o dia/mês que ele agendou para pesquisarmos novamente.`
      };
    }

    return { success: true, data: bookings };

  } catch (error: any) {
    console.error("[Clinic API Error] fetchBookingsByNINAction:", error);
    return {
      success: false,
      error: `Falha interna: ${error.message}`
    };
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
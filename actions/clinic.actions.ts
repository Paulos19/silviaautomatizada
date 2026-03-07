"use server";

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
    // Sanitary Check: Legacy Clinic API (SQL SERVER numeric(11,0)) throws Arithmetic Overflow if mobile has > 11 digits
    if (payload.mobile && typeof payload.mobile === 'string') {
      let cleanMobile = payload.mobile.replace(/\D/g, '');
      if (cleanMobile.startsWith('55') && cleanMobile.length === 13) {
        cleanMobile = cleanMobile.substring(2);
      }
      payload.mobile = cleanMobile.substring(0, 11); // Ensure max 11 digits
    }

    if (payload.nin && typeof payload.nin === 'string') {
      payload.nin = payload.nin.replace(/\D/g, ''); // Ensure CPF is digits only
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
    return { success: true, data: response.result.items || [] };
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

export async function fetchBookingsByNINAction(nin: string, birthday: string) {
  if (!nin || !birthday) return { success: false, error: "Parâmetros incompletos." };
  try {
    const response = await ClinicService.getBookingsByNIN(nin, birthday);
    return { success: true, data: response.result };
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
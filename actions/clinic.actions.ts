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
  if (!nin || !birthday) return { success: false, error: "NIN/Nascimento obrigatórios." };
  try {
    const response = await ClinicService.checkPatientExists(nin, birthday);
    return { success: true, data: response.result };
  } catch (error) {
    return { success: false, error: "Falha ao verificar existência." };
  }
}

// --- Actions de Agendamento e Criação ---
export async function createPatientAction(payload: Record<string, any>) {
  try {
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
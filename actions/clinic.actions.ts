"use server";

import { ClinicService } from "@/services/clinic.service";

export async function fetchPatientsAction(nin?: string) {
  try {
    const response = await ClinicService.getPatients(nin);
    return { success: true, data: response.result.items || [] };
  } catch (error) {
    console.error("[Clinic API Action Error] Failed to fetch patients:", error);
    return { success: false, error: "Falha ao buscar pacientes da Clinic API." };
  }
}

export async function fetchDoctorsAction() {
  try {
    const response = await ClinicService.getDoctors();
    return { success: true, data: response.result.items || [] };
  } catch (error) {
    console.error("[Clinic API Action Error] Failed to fetch doctors:", error);
    return { success: false, error: "Falha ao buscar médicos da Clinic API." };
  }
}
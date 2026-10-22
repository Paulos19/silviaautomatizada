import {
  ClinicDoctorResponseSchema,
  ClinicPatientResponseSchema,
  ClinicSingleDoctorResponseSchema,
  ClinicSinglePatientResponseSchema,
  ClinicPatientExistsSchema,
  ClinicFreeSlotsResponseSchema,
  ClinicBookSlotResponseSchema,
  ClinicInsuranceResponseSchema,
  ClinicBookingsListSchema,
  ClinicBookingsByCpfResponseSchema,
  ClinicSingleBookingResponseSchema
} from "@/schemas/clinic";

const CLINIC_URL = process.env.CLINIC_API_URL;
const CLIENT_ID = process.env.CLINIC_CLIENT_ID;
const CLIENT_SECRET = process.env.CLINIC_CLIENT_SECRET;
const FACILITY_ID = process.env.CLINIC_FACILITY_ID || "";

let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

async function getAccessToken(forceRefresh: boolean = false): Promise<string> {
  if (!forceRefresh && cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 30000) {
    return cachedToken;
  }
  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${CLINIC_URL}/oauth/v1/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Falha na autenticação Clinic API");
  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

async function clinicFetch(endpoint: string, options: RequestInit = {}, isRetry: boolean = false): Promise<any> {
  const token = await getAccessToken(isRetry);
  const response = await fetch(`${CLINIC_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    // Se o token foi invalidado (401, 403, ou 530 com erro de autorização após reinício do Clinic), tenta renovar o token 1 vez
    if (!isRetry && (response.status === 401 || response.status === 403 || (response.status === 530 && errorBody.includes("authorization")))) {
      console.warn(`[Clinic API] Token expirado ou rejeitado (${response.status}). Renovando token automaticamente...`);
      cachedToken = null;
      tokenExpiresAt = null;
      return clinicFetch(endpoint, options, true);
    }

    console.error(`[Clinic API Error] ${response.status}: ${errorBody}`);
    throw new Error(`Erro na integração Clinic: Status ${response.status}`);
  }

  // Tratamento para 204 No Content (Cancelamento) ou respostas sem corpo
  if (response.status === 204) return { success: true };

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : { success: true };
  } catch {
    return { success: true, text };
  }
}

export const ClinicService = {
  async getPatients(nin?: string, page: number = 1, pageSize: number = 10) {
    const url = new URL(`${CLINIC_URL}/api/v1/integration/facilities/${FACILITY_ID}/patients`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("pageSize", pageSize.toString());
    if (nin) url.searchParams.append("nin", nin);
    const data = await clinicFetch(url.pathname + url.search);
    return ClinicPatientResponseSchema.parse(data);
  },

  async getDoctors() {
    const data = await clinicFetch(`/api/v1/integration/facilities/${FACILITY_ID}/doctors?filter_web_disabled=0`);
    return ClinicDoctorResponseSchema.parse(data);
  },

  async getDoctorById(doctorId: string | number) {
    const data = await clinicFetch(`/api/v1/integration/facilities/${FACILITY_ID}/doctors/${doctorId}`);
    return ClinicSingleDoctorResponseSchema.parse(data);
  },

  async getPatientById(patientId: string | number) {
    const data = await clinicFetch(`/api/v1/integration/facilities/${FACILITY_ID}/patients/${patientId}?returnAttendedBy=1`);
    return ClinicSinglePatientResponseSchema.parse(data);
  },

  async checkPatientExists(nin: string, birthday: string) {
    const data = await clinicFetch(`/api/v1/integration/facilities/${FACILITY_ID}/patients/exists?nin=${nin}&birthday=${birthday}`);
    return ClinicPatientExistsSchema.parse(data);
  },

  async createOrUpdatePatient(payload: Record<string, any>) {
    return await clinicFetch(`/api/v1/integration/facilities/${FACILITY_ID}/patients`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getFreeSlots(doctorId: string, addressId: string, startDate: string, endDate: string) {
    const url = `/api/v1/integration/facilities/${FACILITY_ID}/doctors/${doctorId}/addresses/${addressId}/available-slots?start_date=${startDate}&end_date=${endDate}`;
    const data = await clinicFetch(url);
    return ClinicFreeSlotsResponseSchema.parse(data);
  },

  async bookSlot(doctorId: string, addressId: string, slotStart: string, payload: Record<string, any>) {
    const slotPath = encodeURIComponent(slotStart);
    const url = `/api/v1/integration/facilities/${FACILITY_ID}/doctors/${doctorId}/addresses/${addressId}/slots/${slotPath}`;
    const data = await clinicFetch(url, { method: "POST", body: JSON.stringify(payload) });
    return ClinicBookSlotResponseSchema.parse(data);
  },

  async setBookingStatus(doctorId: string, addressId: string, bookingId: string, value: string = "canceled") {
    const facilityId = FACILITY_ID;
    const url = `/api/v1/integration/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}/status?value=${value}`;
    return await clinicFetch(url, { method: "PATCH" });
  },

  async setBookingConfirmation(doctorId: string, addressId: string, bookingId: string, status: "confirmed" | "pending" = "confirmed") {
    const facilityId = FACILITY_ID;
    const url = `/api/v1/integration/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}/confirmation?status=${status}`;
    return await clinicFetch(url, { method: "PATCH" });
  },

  async moveBooking(doctorId: string, addressId: string, bookingId: string, newSlotStart: string) {
    const facilityId = FACILITY_ID;
    const slotPath = encodeURIComponent(newSlotStart);
    const url = `/api/v1/integration/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/booking/${bookingId}/move?slot_start=${slotPath}`;
    return await clinicFetch(url, { method: "POST" });
  },

  async getDoctorBookings(doctorId: string, addressId: string, startDate: string, endDate: string, filters: Record<string, string> = {}) {
    const facilityId = FACILITY_ID;
    const url = new URL(`${CLINIC_URL}/api/v1/integration/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings`);
    url.searchParams.append("start_date", startDate);
    url.searchParams.append("end_date", endDate);
    url.searchParams.append("date_filter_by", "appointment");
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== "") {
        url.searchParams.append(key, val);
      }
    }
    return await clinicFetch(url.pathname + url.search, { method: "GET" });
  },

  async cancelBooking(doctorId: string, addressId: string, bookingId: string, externalId: string = "1") {
    const facilityId = FACILITY_ID;
    // Tenta atualizar o status para canceled no prontuário/histórico da clínica
    try {
      const patchUrl = `/api/v1/integration/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}/status?value=canceled`;
      await clinicFetch(patchUrl, { method: "PATCH" });
    } catch (e: any) {
      console.warn("[ClinicService] PATCH status canceled alert:", e.message);
    }

    // Executa o cancelamento oficial da reserva para desocupar o slot na agenda
    const deleteUrl = `/api/v1/integration/facilities/${facilityId}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}?external_id=${externalId}`;
    return await clinicFetch(deleteUrl, { method: "DELETE" });
  },

  async getInsuranceProviders() {
    const data = await clinicFetch(`/api/v1/integration/insurance-providers`);
    return ClinicInsuranceResponseSchema.parse(data);
  },

  async getPatientBookings(doctorId: string, addressId: string, patientId: string, startDate: string, endDate: string) {
    // Nota: O cURL dizia POST, mas usa query params e o título é GET.
    // O padrão REST para buscas é GET. Se falhar, podemos mudar o method para POST depois.
    const url = `/api/v1/integration/facilities/${FACILITY_ID}/doctors/${doctorId}/addresses/${addressId}/bookings?start_date=${startDate}&end_date=${endDate}&patient_id=${patientId}`;

    const data = await clinicFetch(url, { method: "GET" });
    return ClinicBookingsListSchema.parse(data);
  },

  async getBookingsByNIN(nin: string, birthday: string) {
    const url = `/api/v1/integration/facilities/${FACILITY_ID}/bookings?cpf=${nin}&birthday=${birthday}`;
    const data = await clinicFetch(url, { method: "GET" });
    return ClinicBookingsByCpfResponseSchema.parse(data);
  },

  async getBookingById(doctorId: string, addressId: string, bookingId: string) {
    const url = `/api/v1/integration/facilities/${FACILITY_ID}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}`;
    const data = await clinicFetch(url, { method: "GET" });
    return ClinicSingleBookingResponseSchema.parse(data);
  },
};
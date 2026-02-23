import { 
  ClinicDoctorResponseSchema, 
  ClinicPatientResponseSchema,
  ClinicSingleDoctorResponseSchema,
  ClinicSinglePatientResponseSchema,
  ClinicPatientExistsSchema,
  ClinicFreeSlotsResponseSchema,
  ClinicBookSlotResponseSchema,
  ClinicInsuranceResponseSchema
} from "@/schemas/clinic";

const CLINIC_URL = process.env.CLINIC_API_URL;
const CLIENT_ID = process.env.CLINIC_CLIENT_ID;
const CLIENT_SECRET = process.env.CLINIC_CLIENT_SECRET;
const FACILITY_ID = process.env.CLINIC_FACILITY_ID;

let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 30000) {
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

async function clinicFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
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
    console.error(`[Clinic API Error] ${response.status}: ${errorBody}`);
    throw new Error(`Erro na integração Clinic: Status ${response.status}`);
  }

  // Tratamento para 204 No Content (Cancelamento)
  if (response.status === 204) return { success: true };

  return response.json();
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

  async cancelBooking(doctorId: string, addressId: string, bookingId: string, externalId: string = "1") {
    const url = `/api/v1/integration/facilities/${FACILITY_ID}/doctors/${doctorId}/addresses/${addressId}/bookings/${bookingId}?external_id=${externalId}`;
    return await clinicFetch(url, { method: "DELETE" });
  },

  async getInsuranceProviders() {
    const data = await clinicFetch(`/api/v1/integration/insurance-providers`);
    return ClinicInsuranceResponseSchema.parse(data);
  }
};
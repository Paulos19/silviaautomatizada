import { 
  ClinicDoctorResponseSchema, 
  ClinicPatientResponseSchema 
} from "@/schemas/clinic";

const CLINIC_URL = process.env.CLINIC_API_URL;
const CLIENT_ID = process.env.CLINIC_CLIENT_ID;
const CLIENT_SECRET = process.env.CLINIC_CLIENT_SECRET;
const FACILITY_ID = process.env.CLINIC_FACILITY_ID;

// Cache do token em memória
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

async function getAccessToken(): Promise<string> {
  // Retorna o token em cache se ainda for válido (com margem de segurança de 30s)
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 30000) {
    return cachedToken;
  }

  if (!CLINIC_URL || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Credenciais da Clinic API ausentes no .env");
  }

  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${CLINIC_URL}/oauth/v1/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/json",
    },
    // Next.js: não fazer cache de chamadas de autenticação
    cache: "no-store", 
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Clinic API Auth Error] ${response.status}: ${errorBody}`);
    throw new Error("Falha ao obter token de acesso da Clinic API");
  }

  const data = await response.json();
  
  cachedToken = data.access_token;
  // Converte expires_in (segundos) para timestamp (ms)
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
    console.error(`[Clinic API Request Error] ${response.status}: ${errorBody}`);
    throw new Error(`Erro na integração Clinic: Status ${response.status}`);
  }

  return response.json();
}

export const ClinicService = {
  async getPatients(nin?: string) {
    const url = new URL(`${CLINIC_URL}/api/v1/integration/facilities/${FACILITY_ID}/patients`);
    url.searchParams.append("page", "1");
    url.searchParams.append("pageSize", "100");
    if (nin) url.searchParams.append("nin", nin);

    const data = await clinicFetch(url.pathname + url.search);
    return ClinicPatientResponseSchema.parse(data);
  },

  async getDoctors() {
    const data = await clinicFetch(`/api/v1/integration/facilities/${FACILITY_ID}/doctors?filter_web_disabled=0`);
    return ClinicDoctorResponseSchema.parse(data);
  }
};
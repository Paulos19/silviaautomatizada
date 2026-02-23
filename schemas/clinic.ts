import { z } from "zod";

export const ClinicPatientSchema = z.object({
  id: z.number(),
  // Nome pode vir vazio ou nulo em cadastros incompletos
  name: z.string().nullish(), 
  cpf: z.union([z.string(), z.number()]).nullish(),
  mobile: z.string().nullish(),
  // Removido o .email() para evitar quebra com "emails" como "nao_tem", "-", etc.
  email: z.string().nullish(), 
}).passthrough();

export const ClinicPatientResponseSchema = z.object({
  result: z.object({
    items: z.array(ClinicPatientSchema).optional(),
    id: z.number().optional(),
  })
});

export const ClinicDoctorSchema = z.object({
  id: z.number(),
  name: z.string(),
  crm: z.number().nullish(), // Permite null ou undefined
  specialty: z.string().nullish(), // Correção do erro aqui
  medicalAppointmentWEB: z.string().nullish(),
  // Já vou blindar outros campos baseados no seu payload inicial
  council: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  mobile: z.string().nullish(),
}).passthrough();

export const ClinicDoctorResponseSchema = z.object({
  result: z.object({
    items: z.array(ClinicDoctorSchema)
  })
});

export const ClinicInsuranceProviderSchema = z.object({
  id: z.number(),
  name: z.string().nullish(),
  status: z.boolean().nullish(),
  ans: z.string().nullish(),
  requireRegistration: z.boolean().nullish(),
  requireCardValidity: z.boolean().nullish(),
  requirePlan: z.boolean().nullish(),
  acceptWeb: z.boolean().nullish()
}).passthrough();

export const ClinicInsuranceResponseSchema = z.object({
  result: z.object({
    items: z.array(ClinicInsuranceProviderSchema).nullish()
  }).passthrough()
});

export const ClinicHealthInsuranceCodeSchema = z.object({
  codeHealthInsurance: z.number().nullish(),
  healthInsurance: z.string().nullish(),
  dailyScheduleLimit: z.number().nullish(),
}).passthrough();

export const ClinicSingleDoctorResponseSchema = z.object({
  result: z.object({
    id: z.number(),
    enabled: z.boolean().nullish(),
    crm: z.number().nullish(),
    name: z.string().nullish(),
    nin: z.string().nullish(),
    specialty: z.string().nullish(),
    codeHealthInsurance: z.array(ClinicHealthInsuranceCodeSchema).nullish(),
  }).passthrough()
});

// Reutilizamos o ClinicPatientSchema que criamos anteriormente para a listagem
export const ClinicSinglePatientResponseSchema = z.object({
  result: ClinicPatientSchema.passthrough()
});

export const ClinicPatientExistsSchema = z.object({
  result: z.object({
    patient_id: z.number().nullish(),
    patient_name: z.string().nullish(),
    patient_mobile: z.string().nullish(),
    patient_email: z.string().nullish(),
  }).passthrough()
});

export const ClinicFreeSlotsResponseSchema = z.object({
  result: z.object({
    items: z.array(z.string()).nullish() // Array de ISO Strings
  }).passthrough()
});

export const ClinicBookSlotResponseSchema = z.object({
  result: z.object({
    id: z.number(),
    // Aceitando tanto texto (ex: "booked") quanto número (ex: 1)
    status: z.union([z.string(), z.number()]).nullish(),
    start_at: z.string().nullish(),
    end_at: z.string().nullish(),
  }).passthrough()
});
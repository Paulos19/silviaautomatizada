import { z } from "zod";

export const ClinicPatientSchema = z.object({
  id: z.number(),
  name: z.string(),
  cpf: z.union([z.string(), z.number()]).nullish(),
  mobile: z.string().nullish(),
  email: z.string().email().nullish(),
  // Demais campos...
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
  name: z.string(),
  status: z.boolean(),
}).passthrough();

export const ClinicInsuranceResponseSchema = z.object({
  result: z.object({
    items: z.array(ClinicInsuranceProviderSchema)
  })
});
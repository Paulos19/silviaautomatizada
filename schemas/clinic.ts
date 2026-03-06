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

export const ClinicBookingsListSchema = z.object({
  result: z.object({
    items: z.array(z.object({
      id: z.number(),
      status: z.string().nullish(),
      start_at: z.string().nullish(),
      end_at: z.string().nullish(),
      typeDescription: z.string().nullish(),
      insurance: z.object({
        name: z.string().nullish()
      }).passthrough().nullish() // <-- ORDEM CORRETA AQUI
    }).passthrough()).nullish()
  }).passthrough()
});

// NOVO: Schema baseado no exemplo de busca por CPF/Birthday do usuário
export const ClinicBookingsByCpfResponseSchema = z.object({
  result: z.object({
    id: z.number(),
    doctorId: z.number().nullish(),
    doctor: z.string().nullish(),
    client: z.string().nullish(),
    mobile: z.string().nullish(),
    date_schedule: z.string().nullish(),
    hour_schedule: z.string().nullish(),
    healthInsurance: z.string().nullish(),
    status: z.string().nullish(),
    confirm: z.string().nullish(),
    record: z.number().nullish(),
    cpf: z.union([z.string(), z.number()]).nullish(),
    birthday: z.string().nullish(),
  }).passthrough().nullish()
}).passthrough();

export const ClinicBookingsByPhoneResponseSchema = z.object({
  result: z.object({
    items: z.array(z.object({
      id: z.number(),
      record: z.number().nullish(),
      date: z.string().nullish(),
      hour: z.string().nullish(),
      name: z.string().nullish(),
      doctor_id: z.number().nullish(),
      doctor_name: z.string().nullish(),
      sector: z.string().nullish(),
      address_id: z.union([z.number(), z.string()]).nullish(),
      address_service_id: z.union([z.number(), z.string()]).nullish(),
    }).passthrough()).nullish()
  }).passthrough()
});

export const ClinicSingleBookingResponseSchema = z.object({
  result: z.object({
    id: z.number(),
    status: z.string().nullish(),
    start_at: z.string().nullish(),
    end_at: z.string().nullish(),
    doctor_id: z.number().nullish(),
    doctor_name: z.string().nullish(),
    patient: z.object({
      name: z.string().nullish(),
      surname: z.string().nullish(),
      phone: z.union([z.string(), z.number()]).nullish(),
    }).passthrough().nullish(),
    address_service: z.object({
      name: z.string().nullish(),
    }).passthrough().nullish(),
    insurance: z.object({
      name: z.string().nullish(),
    }).passthrough().nullish(),
  }).passthrough()
});


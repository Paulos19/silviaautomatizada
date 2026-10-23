"use server";

import prisma from "@/lib/prisma";
import { ClinicService } from "@/services/clinic.service";

// --- Actions de Listagem ---
export async function fetchPatientsAction(nin?: string) {
  if (!nin || !nin.trim()) {
    return { success: false, error: "CPF/NIN obrigatório para consulta de paciente." };
  }
  try {
    const cleanNin = nin.replace(/\D/g, "");
    const response = await ClinicService.getPatients(cleanNin, 1, 1);
    return { success: true, data: response.result?.items || [] };
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

export async function checkPatientExistsAction(nin: string, birthday?: string) {
  if (!nin) return { success: false, error: "NIN/CPF obrigatório." };

  try {
    const cleanNin = nin.replace(/\D/g, "");
    if (!cleanNin || cleanNin.length < 7) return { success: false, error: "CPF inválido." };

    // 1. Se birthday foi informado, usa o endpoint dedicado e indexado
    if (birthday && birthday.trim()) {
      try {
        const existsRes = await ClinicService.checkPatientExists(cleanNin, birthday.trim());
        if (existsRes.result?.patient_id) {
          try {
            const fullProfile = await ClinicService.getPatientById(existsRes.result.patient_id);
            const fullPatient = fullProfile.result || fullProfile;
            return {
              success: true,
              data: {
                patient_id: existsRes.result.patient_id,
                patient_name: fullPatient.name,
                patient_mobile: fullPatient.mobile,
                patient_email: fullPatient.email,
                healthInsuranceCode: fullPatient.healthInsuranceCode || fullPatient.insurance_id || fullPatient.healthInsurancePlan || null,
                maritalStatus: fullPatient.maritalStatus || null,
                sex: fullPatient.sex || null
              }
            };
          } catch {
            return {
              success: true,
              data: { patient_id: existsRes.result.patient_id }
            };
          }
        }
      } catch (checkErr) {
        console.warn("[Clinic API] Falha no endpoint exists, usando fallback getPatients(1):", checkErr);
      }
    }

    // 2. Busca estritamente indexada por CPF limitando a 1 único registro (pageSize=1)
    const response = await ClinicService.getPatients(cleanNin, 1, 1);
    const items = response.result?.items;

    if (items && items.length > 0) {
      const patient = items[0];

      // 2. BUSCA COMPLETA (Anti-Alucinação)
      // Tenta pegar o perfil completo para extrair o healthInsuranceCode
      try {
        const fullProfileResponse = await ClinicService.getPatientById(patient.id);

        // Dependendo de como o seu Zod schema mapeia, os dados podem vir direto no objeto ou dentro de um '.result'
        const fullPatient = fullProfileResponse.result || fullProfileResponse;

        return {
          success: true,
          data: {
            patient_id: patient.id,
            patient_name: patient.name,
            patient_mobile: patient.mobile,
            patient_email: patient.email,
            // INJETANDO DADOS PARA A IA:
            // Tenta mapear os nomes mais comuns que a API da clínica possa usar para o convênio
            healthInsuranceCode: fullPatient.healthInsuranceCode || fullPatient.insurance_id || fullPatient.healthInsurancePlan || null,
            maritalStatus: fullPatient.maritalStatus || patient.maritalStatus || null,
            sex: fullPatient.sex || patient.sex || null
          }
        };

      } catch (fullProfileError) {
        // Fallback: Se a busca do perfil completo falhar (API lenta/caiu), 
        // devolve o básico para a IA continuar o fluxo sem o convênio (e ela chamará a Tool_Listar_Convenios).
        console.error("[Clinic API Error] Erro ao buscar perfil completo, retornando básico:", fullProfileError);
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
    }

    // Se o array de items vier vazio, paciente não existe
    return { success: false, error: "Paciente não encontrado." };

  } catch (error) {
    console.error("[Clinic API Error] checkPatientExistsAction:", error);
    return { success: false, error: "Falha ao verificar existência." };
  }
}

// --- Actions de Agendamento e Criação ---
export async function createPatientAction(payload: Record<string, any>) {
  try {
    // 1. Limpeza de Celular (Já estava no seu código)
    if (payload.mobile && typeof payload.mobile === 'string') {
      let cleanMobile = payload.mobile.replace(/\D/g, '');
      if (cleanMobile.startsWith('55') && cleanMobile.length === 13) {
        cleanMobile = cleanMobile.substring(2);
      }
      payload.mobile = cleanMobile.substring(0, 11);
    }

    // 2. Limpeza de CPF (Já estava no seu código)
    if (payload.nin && typeof payload.nin === 'string') {
      payload.nin = payload.nin.replace(/\D/g, '');
    }

    // 3. Tratamento de Data de Nascimento (Garante o formato YYYY-MM-DD)
    if (payload.birthday && typeof payload.birthday === 'string' && payload.birthday.includes('/')) {
      const parts = payload.birthday.split('/');
      if (parts.length === 3) {
        let [day, month, year] = parts.map((p: string) => p.trim());
        if (year.length === 2) {
          year = parseInt(year, 10) > 30 ? `19${year}` : `20${year}`;
        }
        payload.birthday = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    // 4. Tratamento do Convênio e Carteirinha (Atualizado)
    // O n8n agora envia diretamente a chave "registration" quando o paciente pede para atualizar.
    // A API Legacy receberá o campo "registration" nativamente no payload e deverá salvá-lo.

    // Caso a API da clínica exija que esse número vá mapeado em outro campo na hora do POST 
    // (por exemplo, dentro de healthInsurancePlan), você pode descomentar o bloco abaixo:
    /*
    if (payload.registration) {
      payload.healthInsurancePlan = payload.registration;
      // delete payload.registration; // Descomente apenas se a API der erro com 'registration'
    }
    */

    // 5. Garantia de campo obrigatório external_id (Exigido estritamente pela API da Clínica)
    payload.external_id = payload.external_id !== undefined && payload.external_id !== null ? String(payload.external_id) : "";

    // 6. Conversão de código do convênio para numérico se presente
    if (payload.healthInsuranceCode && typeof payload.healthInsuranceCode === 'string') {
      const parsedCode = parseInt(payload.healthInsuranceCode, 10);
      if (!isNaN(parsedCode)) {
        payload.healthInsuranceCode = parsedCode;
      }
    }

    const response = await ClinicService.createOrUpdatePatient(payload);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("[Clinic API Error] createPatient:", error.message);
    return { success: false, error: error.message || "Falha ao criar/atualizar paciente." };
  }
}

export async function fetchFreeSlotsAction(doctorId: string, addressId: string, startDate: string, endDate: string) {
  if (!doctorId || !addressId || !startDate || !endDate) return { success: false, error: "Parâmetros incompletos." };

  try {
    const response = await ClinicService.getFreeSlots(doctorId, addressId, startDate, endDate);
    let slots = response.result.items || [];

    // 1. Opcional, mas recomendado: Garantir que estão em ordem cronológica
    // slots.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // 2. CORTE AJUSTADO: 30 horários garantem bons dias de agenda 
    // sem estourar a janela de contexto (tokens) da IA.
    const limitedSlots = slots.slice(0, 30);

    return { success: true, data: limitedSlots };
  } catch (error: any) {
    console.error("[Clinic API Error] getFreeSlots:", error.message);
    return { success: false, error: "Falha ao buscar horários livres." };
  }
}

export async function bookSlotAction(doctorId: string, addressId: string, slotStart: string, payload: Record<string, any>) {
  try {
    const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "";
    const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "";
    if (!finalDoctorId || !finalAddressId) {
      return { success: false, error: "CLINIC_DOCTOR_ID ou CLINIC_ADDRESS_ID não configurados." };
    }

    // Mapeamento e normalização dos campos exigidos pela Clinic API
    let healthInsuranceCode = 
      payload.healthInsuranceCode ?? 
      payload.health_insurance_id ?? 
      payload.healthInsuranceId ?? 
      payload.health_insurance_code;

    // Se ainda não tiver código do convênio e temos o patient_id, busca no cadastro do paciente
    if (!healthInsuranceCode && payload.patient_id) {
      try {
        const patientData = await ClinicService.getPatientById(payload.patient_id);
        healthInsuranceCode = patientData.result?.healthInsuranceCode;
      } catch (e: any) {
        console.warn("[bookSlotAction] Falha ao recuperar convênio do paciente:", e.message);
      }
    }

    // Fallback padrão para Unimed (260) se não identificado
    if (!healthInsuranceCode || Number(healthInsuranceCode) === 0) {
      healthInsuranceCode = 260;
    }

    const cleanPayload = {
      address_service_id: payload.address_service_id || 1,
      external_id: payload.external_id || "1",
      patient_id: Number(payload.patient_id),
      obs: payload.obs || payload.note || payload.observacoes || "Agendado via Silv.IA",
      healthInsuranceCode: Number(healthInsuranceCode),
      consultationType: payload.consultationType || 1,
      appointmentType: payload.appointmentType || payload.type || 1,
    };

    const response = await ClinicService.bookSlot(finalDoctorId, finalAddressId, slotStart, cleanPayload);
    return { success: true, data: response.result };
  } catch (error: any) {
    console.error("[Clinic API Error] bookSlot:", error.message);
    return { success: false, error: "Falha ao agendar consulta: " + error.message };
  }
}

export async function cancelBookingAction(doctorId?: string, addressId?: string, bookingId?: string, externalId: string = "1") {
  const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "";
  const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "";

  if (!finalDoctorId || !finalAddressId) return { success: false, error: "CLINIC_DOCTOR_ID ou CLINIC_ADDRESS_ID não configurados." };

  if (!bookingId) return { success: false, error: "ID do agendamento (bookingId) é obrigatório." };

  try {
    const response = await ClinicService.cancelBooking(finalDoctorId, finalAddressId, bookingId, externalId);
    return { success: true, data: response || "Agendamento cancelado com sucesso." };
  } catch (error: any) {
    console.error("[Clinic API Error] cancelBooking:", error.message);
    return { success: false, error: "Falha ao cancelar agendamento." };
  }
}

export async function setBookingConfirmationAction(
  doctorId?: string,
  addressId?: string,
  bookingId?: string,
  status: "confirmed" | "pending" = "confirmed"
) {
  const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "";
  const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "";

  if (!finalDoctorId || !finalAddressId) return { success: false, error: "CLINIC_DOCTOR_ID ou CLINIC_ADDRESS_ID não configurados." };

  if (!bookingId) return { success: false, error: "ID do agendamento (bookingId) é obrigatório." };

  try {
    const response = await ClinicService.setBookingConfirmation(finalDoctorId, finalAddressId, bookingId, status);
    return { success: true, data: response || "Status de confirmação atualizado." };
  } catch (error: any) {
    console.error("[Clinic API Error] setBookingConfirmation:", error.message);
    return { success: false, error: "Falha ao atualizar confirmação do agendamento." };
  }
}

export async function fetchDoctorBookingsAction(
  doctorId?: string,
  addressId?: string,
  startDate?: string,
  endDate?: string,
  filters: Record<string, string> = {}
) {
  const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "";
  const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "";
  const todayStr = new Date().toISOString().split("T")[0];
  const finalStartDate = startDate || todayStr;
  const finalEndDate = endDate || finalStartDate;

  try {
    const response = await ClinicService.getDoctorBookings(finalDoctorId, finalAddressId, finalStartDate, finalEndDate, filters);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("[Clinic API Error] fetchDoctorBookings:", error.message);
    return { success: false, error: "Falha ao buscar agendamentos do médico." };
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

export async function fetchBookingsByNINAction(nin: string, birthday?: string, doctorId?: string, addressId?: string) {
  if (!nin) return { success: false, error: "CPF/NIN é obrigatório." };
  try {
    const cleanNin = nin.replace(/\D/g, "");
    // Passo 1: Descobrir o patientId pelo CPF (estritamente 1 registro indexado)
    const patientsResponse = await ClinicService.getPatients(cleanNin, 1, 1);
    const items = patientsResponse.result?.items;

    if (!items || items.length === 0) {
      return { success: false, error: "Paciente não encontrado com esse CPF." };
    }

    const patientId = String(items[0].id);

    // Passo 2: Buscar agendamentos usando o endpoint da agenda (30 dias atrás até 365 dias no futuro)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const startDate = pastDate.toISOString().split('T')[0];

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 365);
    const endDate = futureDate.toISOString().split('T')[0];

    const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "";
    const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "";

    const response = await ClinicService.getPatientBookings(
      finalDoctorId,
      finalAddressId,
      patientId,
      startDate,
      endDate
    );

    return { success: true, data: response };
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

export async function createPrescriptionRequestAction(data: {
  patientName: string;
  birthDate: string;
  unimedCard: string;
  address: string;
  medications: string;
  phone?: string;
  passarCarteirinha?: boolean;
  receitaAzul?: boolean;
  status?: string;
  forceCreate?: boolean;
}) {
  try {
    const rawName = (data.patientName || "").trim();
    const rawCard = (data.unimedCard || "").replace(/\s+/g, "");
    const rawPhone = (data.phone || "").trim();

    // Busca se já existe uma solicitação PENDENTE recente deste mesmo paciente (últimas 48h)
    // para evitar que mensagens sequenciais no WhatsApp multipliquem os cards
    let existing = null;

    if (!data.forceCreate && (rawName || rawCard)) {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      existing = await (prisma as any).prescriptionRequest.findFirst({
        where: {
          status: "PENDENTE",
          createdAt: { gte: fortyEightHoursAgo },
          OR: [
            ...(rawName ? [{ patientName: { equals: rawName, mode: "insensitive" as const } }] : []),
            ...(rawCard ? [{ unimedCard: { contains: rawCard } }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (existing) {
      // Atualiza a solicitação pendente existente com as informações mais recentes/completas
      try {
        const updated = await (prisma as any).prescriptionRequest.update({
          where: { id: existing.id },
          data: {
            patientName: rawName || existing.patientName,
            birthDate: data.birthDate?.trim() || existing.birthDate,
            unimedCard: (data.unimedCard?.trim() || existing.unimedCard).replace(/\s+/g, ""),
            address: data.address?.trim() || existing.address,
            medications: data.medications?.trim() || existing.medications,
            ...(rawPhone ? { phone: rawPhone } : {}),
            ...(typeof data.passarCarteirinha === "boolean" ? { passarCarteirinha: data.passarCarteirinha } : {}),
            ...(typeof data.receitaAzul === "boolean" ? { receitaAzul: data.receitaAzul } : {}),
            ...(data.status ? { status: data.status } : {}),
          },
        });
        return { success: true, data: updated, isUpdate: true };
      } catch (updateErr: any) {
        const updated = await (prisma as any).prescriptionRequest.update({
          where: { id: existing.id },
          data: {
            patientName: rawName || existing.patientName,
            birthDate: data.birthDate?.trim() || existing.birthDate,
            unimedCard: (data.unimedCard?.trim() || existing.unimedCard).replace(/\s+/g, ""),
            address: data.address?.trim() || existing.address,
            medications: data.medications?.trim() || existing.medications,
            ...(rawPhone ? { phone: rawPhone } : {}),
            ...(typeof data.passarCarteirinha === "boolean" ? { passarCarteirinha: data.passarCarteirinha } : {}),
            ...(data.status ? { status: data.status } : {}),
          },
        });
        if (typeof data.receitaAzul === "boolean") {
          await prisma.$executeRawUnsafe(
            'UPDATE "PrescriptionRequest" SET "receitaAzul" = $1, "updatedAt" = NOW() WHERE "id" = $2',
            data.receitaAzul,
            existing.id
          );
          updated.receitaAzul = data.receitaAzul;
        }
        return { success: true, data: updated, isUpdate: true };
      }
    }

    try {
      const request = await (prisma as any).prescriptionRequest.create({
        data: {
          patientName: rawName || "Paciente sem nome",
          birthDate: data.birthDate?.trim() || "",
          unimedCard: (data.unimedCard || "").replace(/\s+/g, ""),
          address: data.address?.trim() || "",
          medications: data.medications?.trim() || "",
          phone: rawPhone || null,
          passarCarteirinha: Boolean(data.passarCarteirinha),
          receitaAzul: Boolean(data.receitaAzul),
          status: data.status || "PENDENTE",
        },
      });
      return { success: true, data: request, isUpdate: false };
    } catch (createErr: any) {
      const request = await (prisma as any).prescriptionRequest.create({
        data: {
          patientName: rawName || "Paciente sem nome",
          birthDate: data.birthDate?.trim() || "",
          unimedCard: (data.unimedCard || "").replace(/\s+/g, ""),
          address: data.address?.trim() || "",
          medications: data.medications?.trim() || "",
          passarCarteirinha: Boolean(data.passarCarteirinha),
          status: data.status || "PENDENTE",
        },
      });
      if (data.receitaAzul || rawPhone) {
        await prisma.$executeRawUnsafe(
          'UPDATE "PrescriptionRequest" SET "receitaAzul" = COALESCE($1, "receitaAzul"), "phone" = COALESCE($2, "phone") WHERE "id" = $3',
          Boolean(data.receitaAzul),
          rawPhone || null,
          request.id
        );
        request.receitaAzul = Boolean(data.receitaAzul);
        request.phone = rawPhone || null;
      }
      return { success: true, data: request, isUpdate: false };
    }
  } catch (error: any) {
    console.error("Erro ao criar ou atualizar solicitação de receita:", error);
    return { success: false, error: "Falha ao salvar a solicitação de receita." };
  }
}

export async function togglePassarCarteirinhaAction(id: string, passarCarteirinha: boolean) {
  try {
    const updated = await (prisma as any).prescriptionRequest.update({
      where: { id },
      data: { passarCarteirinha },
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Erro ao alternar tag Passar Carteirinha:", error);
    return { success: false, error: "Falha ao alternar tag Passar Carteirinha." };
  }
}

export async function toggleReceitaAzulAction(id: string, receitaAzul: boolean) {
  try {
    try {
      const updated = await (prisma as any).prescriptionRequest.update({
        where: { id },
        data: { receitaAzul },
      });
      return { success: true, data: updated };
    } catch (prismaErr: any) {
      // Fallback via raw SQL caso o Prisma Client em memória no dev server ainda não tenha recarregado o modelo
      await prisma.$executeRawUnsafe(
        'UPDATE "PrescriptionRequest" SET "receitaAzul" = $1, "updatedAt" = NOW() WHERE "id" = $2',
        receitaAzul,
        id
      );
      const rows: any[] = await prisma.$queryRawUnsafe(
        'SELECT * FROM "PrescriptionRequest" WHERE "id" = $1 LIMIT 1',
        id
      );
      return { success: true, data: rows[0] };
    }
  } catch (error: any) {
    console.error("Erro ao alternar tag Receita Azul:", error);
    return { success: false, error: "Falha ao alternar tag Receita Azul." };
  }
}

export async function fetchPrescriptionRequestsAction() {
  try {
    // Busca via $queryRawUnsafe para garantir que a coluna receitaAzul venha mapeada
    // mesmo se o Prisma Client em memória não tiver sido reiniciado ainda
    try {
      const requests = await prisma.$queryRawUnsafe<any[]>(
        'SELECT * FROM "PrescriptionRequest" ORDER BY "createdAt" DESC'
      );
      return { success: true, data: requests };
    } catch (rawErr) {
      const requests = await prisma.prescriptionRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data: requests };
    }
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

export async function deletePrescriptionRequestAction(id: string) {
  try {
    const deleted = await prisma.prescriptionRequest.delete({
      where: { id },
    });
    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("Erro ao deletar solicitação de receita:", error);
    return { success: false, error: "Falha ao deletar solicitação de receita." };
  }
}

export async function searchPatientsAction(query: string) {
  if (!query || !query.trim()) {
    return { success: false, error: "Termo de busca obrigatório." };
  }
  const clean = query.trim();
  const digitsOnly = clean.replace(/\D/g, "");

  try {
    // A Clinic API indexa consultas estritamente por CPF/NIN.
    // Buscas abertas sem CPF foram definitivamente removidas para proteger a integridade do banco.
    if (digitsOnly.length >= 7) {
      const res = await ClinicService.getPatients(digitsOnly, 1, 1);
      return { success: true, data: res.result?.items || [] };
    }

    return {
      success: false,
      error: "Para consultar na base da clínica, informe o CPF do paciente.",
      data: []
    };
  } catch (error: any) {
    console.error("[Clinic API Error] searchPatientsAction:", error);
    return { success: false, error: "Falha ao buscar pacientes: " + error.message };
  }
}

export async function moveBookingAction(
  doctorId?: string,
  addressId?: string,
  bookingId?: string,
  newSlotStart?: string
) {
  const finalDoctorId = doctorId || process.env.CLINIC_DOCTOR_ID || "";
  const finalAddressId = addressId || process.env.CLINIC_ADDRESS_ID || "";

  if (!bookingId || !newSlotStart) {
    return { success: false, error: "bookingId e newSlotStart são obrigatórios." };
  }

  try {
    const response = await ClinicService.moveBooking(finalDoctorId, finalAddressId, bookingId, newSlotStart);
    return { success: true, data: response || "Consulta reagendada com sucesso." };
  } catch (error: any) {
    console.error("[Clinic API Error] moveBookingAction:", error.message);
    return { success: false, error: "Falha ao reagendar consulta: " + error.message };
  }
}

export async function updatePrescriptionAction(id: string, data: {
  patientName?: string;
  birthDate?: string;
  unimedCard?: string;
  address?: string;
  medications?: string;
  phone?: string;
  status?: string;
  passarCarteirinha?: boolean;
  receitaAzul?: boolean;
  lastNotifiedAt?: Date;
}) {
  if (!id) return { success: false, error: "ID da receita é obrigatório." };
  try {
    const rawPhone = data.phone !== undefined ? data.phone.trim() : undefined;
    try {
      const updated = await (prisma as any).prescriptionRequest.update({
        where: { id },
        data: {
          ...(data.patientName ? { patientName: data.patientName.trim() } : {}),
          ...(data.birthDate ? { birthDate: data.birthDate.trim() } : {}),
          ...(data.unimedCard !== undefined ? { unimedCard: data.unimedCard.replace(/\s+/g, "") } : {}),
          ...(data.address ? { address: data.address.trim() } : {}),
          ...(data.medications ? { medications: data.medications.trim() } : {}),
          ...(rawPhone !== undefined ? { phone: rawPhone } : {}),
          ...(data.status ? { status: data.status.trim() } : {}),
          ...(typeof data.passarCarteirinha === "boolean" ? { passarCarteirinha: data.passarCarteirinha } : {}),
          ...(typeof data.receitaAzul === "boolean" ? { receitaAzul: data.receitaAzul } : {}),
          ...(data.lastNotifiedAt ? { lastNotifiedAt: data.lastNotifiedAt } : {}),
        },
      });
      return { success: true, data: updated };
    } catch (err) {
      try {
        const updated = await (prisma as any).prescriptionRequest.update({
          where: { id },
          data: {
            ...(data.patientName ? { patientName: data.patientName.trim() } : {}),
            ...(data.birthDate ? { birthDate: data.birthDate.trim() } : {}),
            ...(data.unimedCard !== undefined ? { unimedCard: data.unimedCard.replace(/\s+/g, "") } : {}),
            ...(data.address ? { address: data.address.trim() } : {}),
            ...(data.medications ? { medications: data.medications.trim() } : {}),
            ...(data.status ? { status: data.status.trim() } : {}),
            ...(typeof data.passarCarteirinha === "boolean" ? { passarCarteirinha: data.passarCarteirinha } : {}),
          },
        });
        if (typeof data.receitaAzul === "boolean" || rawPhone !== undefined || data.lastNotifiedAt) {
          await prisma.$executeRawUnsafe(
            `UPDATE "PrescriptionRequest"
             SET "receitaAzul" = COALESCE($1, "receitaAzul"),
                 "phone" = COALESCE($2, "phone"),
                 "lastNotifiedAt" = COALESCE($3, "lastNotifiedAt"),
                 "updatedAt" = NOW()
             WHERE "id" = $4`,
            typeof data.receitaAzul === "boolean" ? data.receitaAzul : null,
            rawPhone !== undefined ? rawPhone : null,
            data.lastNotifiedAt || null,
            id
          );
          if (typeof data.receitaAzul === "boolean") updated.receitaAzul = data.receitaAzul;
          if (rawPhone !== undefined) updated.phone = rawPhone;
          if (data.lastNotifiedAt) updated.lastNotifiedAt = data.lastNotifiedAt;
        }
        return { success: true, data: updated };
      } catch (rawErr) {
        // Fallback completo via SQL raw caso o engine do Prisma Client esteja bloqueado
        await prisma.$executeRawUnsafe(
          `UPDATE "PrescriptionRequest"
           SET "patientName" = COALESCE($1, "patientName"),
               "birthDate" = COALESCE($2, "birthDate"),
               "unimedCard" = COALESCE($3, "unimedCard"),
               "address" = COALESCE($4, "address"),
               "medications" = COALESCE($5, "medications"),
               "phone" = COALESCE($6, "phone"),
               "status" = COALESCE($7, "status"),
               "passarCarteirinha" = COALESCE($8, "passarCarteirinha"),
               "receitaAzul" = COALESCE($9, "receitaAzul"),
               "lastNotifiedAt" = COALESCE($10, "lastNotifiedAt"),
               "updatedAt" = NOW()
           WHERE "id" = $11`,
          data.patientName ? data.patientName.trim() : null,
          data.birthDate ? data.birthDate.trim() : null,
          data.unimedCard !== undefined ? data.unimedCard.replace(/\s+/g, "") : null,
          data.address ? data.address.trim() : null,
          data.medications ? data.medications.trim() : null,
          rawPhone !== undefined ? rawPhone : null,
          data.status ? data.status.trim() : null,
          typeof data.passarCarteirinha === "boolean" ? data.passarCarteirinha : null,
          typeof data.receitaAzul === "boolean" ? data.receitaAzul : null,
          data.lastNotifiedAt || null,
          id
        );
        const rows: any[] = await prisma.$queryRawUnsafe(
          'SELECT * FROM "PrescriptionRequest" WHERE "id" = $1 LIMIT 1',
          id
        );
        return { success: true, data: rows[0] };
      }
    }
  } catch (error: any) {
    console.error("Erro ao atualizar receita médica:", error);
    return { success: false, error: "Falha ao atualizar receita médica." };
  }
}

export async function searchPrescriptionsAction(query?: string, status?: string) {
  try {
    const where: any = {};
    if (query?.trim()) {
      where.OR = [
        { patientName: { contains: query.trim(), mode: "insensitive" } },
        { medications: { contains: query.trim(), mode: "insensitive" } },
        { unimedCard: { contains: query.trim() } },
      ];
    }
    if (status?.trim()) {
      where.status = { equals: status.trim(), mode: "insensitive" };
    }
    const list = await prisma.prescriptionRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { success: true, data: list };
  } catch (error: any) {
    console.error("Erro ao buscar receitas:", error);
    return { success: false, error: "Falha ao buscar receitas." };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TEMPLATES DE MENSAGEM & DISPARO DE AVISO DE RECEITA PRONTA
// ════════════════════════════════════════════════════════════════════════════════

const DEFAULT_PRESCRIPTION_TEMPLATES = [
  {
    title: "Receita Pronta - Retirada na Clínica",
    content: `Olá, {nome_paciente}! Tudo bem? 😊

Informamos que a sua receita médica solicitada ao {medico} já está pronta para retirada na nossa clínica!

📋 *Medicamentos:*
{conteudo_receita}

📍 *Endereço:* Hospital Otorrinos Curitiba - Rua Doutor Roberto Barrozo, 1381 - Mercês
⏰ *Horário de Atendimento:* Segunda a Sexta, das 08h às 18h

Qualquer dúvida, estamos à disposição!`,
    isDefault: true,
  },
  {
    title: "Receita Digital Emitida",
    content: `Olá, {nome_paciente}! Tudo bem?

Sua receita médica do {medico} já foi emitida com sucesso!

📋 *Prescrição:*
{conteudo_receita}

Data de emissão: {data} às {horario}.
Se precisar de mais alguma orientação, conte conosco!`,
    isDefault: false,
  },
  {
    title: "Receita Azul (Notificação Especial)",
    content: `Olá, {nome_paciente}! Tudo bem?

Sua receita de controle especial (Receita Azul) emitida pelo {medico} está pronta!

📋 *Medicamentos:*
{conteudo_receita}

⚠️ *Atenção:* Por se tratar de receituário de controle especial (notificação azul), a receita física original deve ser retirada presencialmente na clínica mediante apresentação de documento com foto.

📍 Hospital Otorrinos Curitiba - Rua Doutor Roberto Barrozo, 1381 - Mercês`,
    isDefault: false,
  },
];

export async function fetchPrescriptionMessageTemplatesAction() {
  try {
    let rows: any[] = [];
    try {
      rows = await prisma.$queryRawUnsafe<any[]>(
        'SELECT * FROM "PrescriptionMessageTemplate" ORDER BY "isDefault" DESC, "createdAt" ASC'
      );
    } catch {
      try {
        rows = await (prisma as any).prescriptionMessageTemplate.findMany({
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        });
      } catch (e) {
        console.warn("Could not query PrescriptionMessageTemplate:", e);
      }
    }

    if (!rows || rows.length === 0) {
      // Auto-seed default templates
      for (const tpl of DEFAULT_PRESCRIPTION_TEMPLATES) {
        const id = "tpl_" + Math.random().toString(36).substring(2, 11);
        try {
          await prisma.$executeRawUnsafe(
            'INSERT INTO "PrescriptionMessageTemplate" ("id", "title", "content", "isDefault", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
            id,
            tpl.title,
            tpl.content,
            tpl.isDefault
          );
        } catch (seedErr) {
          console.warn("Error seeding template:", seedErr);
        }
      }
      try {
        rows = await prisma.$queryRawUnsafe<any[]>(
          'SELECT * FROM "PrescriptionMessageTemplate" ORDER BY "isDefault" DESC, "createdAt" ASC'
        );
      } catch {
        rows = DEFAULT_PRESCRIPTION_TEMPLATES.map((t, i) => ({
          id: `seed_${i}`,
          title: t.title,
          content: t.content,
          isDefault: t.isDefault,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }
    }

    return { success: true, data: rows };
  } catch (error: any) {
    console.error("Erro ao carregar templates de mensagem:", error);
    return { success: false, error: "Falha ao carregar templates de mensagem." };
  }
}

export async function savePrescriptionMessageTemplateAction(data: {
  id?: string;
  title: string;
  content: string;
  isDefault?: boolean;
}) {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "O título do template é obrigatório." };
    }
    if (!data.content?.trim()) {
      return { success: false, error: "O conteúdo do template é obrigatório." };
    }

    const title = data.title.trim();
    const content = data.content.trim();
    const isDefault = Boolean(data.isDefault);

    if (isDefault) {
      try {
        await prisma.$executeRawUnsafe(
          'UPDATE "PrescriptionMessageTemplate" SET "isDefault" = false'
        );
      } catch (unmarkErr) {
        console.warn("Could not unmark default templates:", unmarkErr);
      }
    }

    if (data.id) {
      await prisma.$executeRawUnsafe(
        'UPDATE "PrescriptionMessageTemplate" SET "title" = $1, "content" = $2, "isDefault" = $3, "updatedAt" = NOW() WHERE "id" = $4',
        title,
        content,
        isDefault,
        data.id
      );
      const rows: any[] = await prisma.$queryRawUnsafe(
        'SELECT * FROM "PrescriptionMessageTemplate" WHERE "id" = $1 LIMIT 1',
        data.id
      );
      return { success: true, data: rows[0] };
    } else {
      const id = "tpl_" + Math.random().toString(36).substring(2, 11);
      await prisma.$executeRawUnsafe(
        'INSERT INTO "PrescriptionMessageTemplate" ("id", "title", "content", "isDefault", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
        id,
        title,
        content,
        isDefault
      );
      const rows: any[] = await prisma.$queryRawUnsafe(
        'SELECT * FROM "PrescriptionMessageTemplate" WHERE "id" = $1 LIMIT 1',
        id
      );
      return { success: true, data: rows[0] };
    }
  } catch (error: any) {
    console.error("Erro ao salvar template de mensagem:", error);
    return { success: false, error: "Falha ao salvar template." };
  }
}

export async function deletePrescriptionMessageTemplateAction(id: string) {
  try {
    if (!id) return { success: false, error: "ID do template é obrigatório." };
    await prisma.$executeRawUnsafe(
      'DELETE FROM "PrescriptionMessageTemplate" WHERE "id" = $1',
      id
    );
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir template de mensagem:", error);
    return { success: false, error: "Falha ao excluir template." };
  }
}

function normalizeWhatsAppNumber(rawPhone: string): string {
  let cleaned = (rawPhone || "").replace(/\D/g, "");
  if (!cleaned) return "";
  if (!cleaned.startsWith("55") && (cleaned.length === 10 || cleaned.length === 11)) {
    cleaned = `55${cleaned}`;
  }
  return cleaned;
}

export async function dispatchPrescriptionReadyMessageAction(params: {
  prescriptionId: string;
  phone: string;
  messageText: string;
  markCompleted?: boolean;
}) {
  try {
    const { prescriptionId, phone, messageText, markCompleted } = params;

    if (!phone || !phone.trim()) {
      return { success: false, error: "Número de WhatsApp do paciente é obrigatório." };
    }
    if (!messageText || !messageText.trim()) {
      return { success: false, error: "A mensagem a ser enviada não pode estar vazia." };
    }

    const cleanNumber = normalizeWhatsAppNumber(phone);
    if (cleanNumber.length < 10) {
      return { success: false, error: "Número de telefone inválido (formato esperado: DDD + Número)." };
    }

    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;
    const evoInst = process.env.EVOLUTION_INSTANCE || "";

    if (!evoUrl || !evoKey || !evoInst) {
      return { success: false, error: "Credenciais de WhatsApp não configuradas no servidor." };
    }

    const evoResp = await fetch(`${evoUrl}/message/sendText/${evoInst}`, {
      method: "POST",
      headers: {
        apikey: evoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: messageText,
      }),
    });

    if (!evoResp.ok) {
      const errText = await evoResp.text();
      console.error("[dispatchPrescriptionReadyMessageAction] Erro Evolution API:", evoResp.status, errText);
      return { success: false, error: `Falha ao enviar mensagem via WhatsApp (Evolution API: ${evoResp.status}).` };
    }

    // Registra envio e atualiza telefone no PrescriptionRequest
    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE "PrescriptionRequest"
       SET "phone" = $1,
           "lastNotifiedAt" = $2,
           ${markCompleted ? '"status" = \'CONCLUIDO\',' : ''}
           "updatedAt" = NOW()
       WHERE "id" = $3`,
      phone.trim(),
      now,
      prescriptionId
    );

    return { success: true, lastNotifiedAt: now };
  } catch (error: any) {
    console.error("Erro ao disparar mensagem de receita:", error);
    return { success: false, error: error.message || "Falha ao disparar mensagem." };
  }
}

export async function bulkDispatchPrescriptionReadyMessagesAction(params: {
  dispatches: Array<{
    prescriptionId: string;
    phone: string;
    messageText: string;
  }>;
  markCompleted?: boolean;
}) {
  try {
    const { dispatches, markCompleted } = params;
    if (!dispatches || dispatches.length === 0) {
      return { success: false, error: "Nenhum paciente selecionado para disparo." };
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const item of dispatches) {
      try {
        const res = await dispatchPrescriptionReadyMessageAction({
          prescriptionId: item.prescriptionId,
          phone: item.phone,
          messageText: item.messageText,
          markCompleted,
        });

        if (res.success) {
          sentCount++;
        } else {
          failedCount++;
          errors.push(`${item.phone || item.prescriptionId}: ${res.error}`);
        }
        // Intervalo de segurança anti-ban entre os disparos (600ms)
        await new Promise((r) => setTimeout(r, 600));
      } catch (err: any) {
        failedCount++;
        errors.push(`${item.phone || item.prescriptionId}: ${err.message}`);
      }
    }

    return {
      success: sentCount > 0,
      sentCount,
      failedCount,
      errors,
    };
  } catch (error: any) {
    console.error("Erro no disparo em massa de receitas:", error);
    return { success: false, error: "Falha geral no disparo em massa." };
  }
}


import { NextResponse } from "next/server";
import {
  checkPatientExistsAction,
  createPatientAction,
  fetchFreeSlotsAction,
  bookSlotAction,
  cancelBookingAction,
  fetchInsuranceProvidersAction,
  fetchSingleDoctorAction,
  fetchDoctorsAction,
  fetchPatientBookingsAction,
  fetchBookingsByNINAction,
  createPrescriptionRequestAction // <-- Nova action importada aqui
} from "@/actions/clinic.actions";
import { loadRagAction } from "@/actions/rag.actions";

// Validação de segurança: Só o n8n pode chamar essa rota
function verifyN8nAuth(request: Request) {
  const authHeader = request.headers.get("x-n8n-webhook-secret");
  return authHeader === process.env.N8N_WEBHOOK_SECRET;
}

export async function POST(request: Request) {
  if (!verifyN8nAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized. Invalid Webhook Secret." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, payload } = body;

    console.log(`[n8n Request] Action: ${action}`, payload);

    switch (action) {
      case "CHECK_PATIENT":
        return NextResponse.json(await checkPatientExistsAction(payload.nin, payload.birthday));

      case "CREATE_PATIENT":
        return NextResponse.json(await createPatientAction(payload));

      case "GET_SLOTS": {
        // Garante que se a IA não mandar startDate, usemos hoje
        const todayStr = new Date().toISOString().split('T')[0];
        const startDate = payload.startDate?.trim() ? payload.startDate : todayStr;
        const startDateObj = new Date(startDate);

        let finalEndDate = payload.endDate;

        // Se a IA NÃO enviou uma data final (ou enviou vazio), calculamos 90 dias de segurança
        if (!finalEndDate || finalEndDate.trim() === "") {
          const endDateObj = new Date(startDateObj);
          endDateObj.setDate(endDateObj.getDate() + 90);
          finalEndDate = endDateObj.toISOString().split('T')[0];
        }

        // 1. Fazemos a busca original solicitada pela IA
        let result: any = await fetchFreeSlotsAction(
          payload.doctorId,
          payload.addressId,
          startDate,
          finalEndDate
        );

        // 2. INTERVENÇÃO ANTI-ALUCINAÇÃO:
        // Se a busca voltou vazia E o paciente tinha pedido um período específico (endDate original estava preenchido)
        if (result?.success && Array.isArray(result?.data) && result.data.length === 0 && payload.endDate?.trim()) {
          const fallbackStartDateObj = new Date(); // Começa a buscar de hoje
          const fallbackEndDateObj = new Date();
          fallbackEndDateObj.setDate(fallbackEndDateObj.getDate() + 90); // Até 90 dias para frente

          const fallbackStartDate = fallbackStartDateObj.toISOString().split('T')[0];
          const fallbackEndDate = fallbackEndDateObj.toISOString().split('T')[0];

          const fallbackResult: any = await fetchFreeSlotsAction(
            payload.doctorId,
            payload.addressId,
            fallbackStartDate,
            fallbackEndDate
          );

          return NextResponse.json({
            success: true,
            data: fallbackResult?.data || [],
            _aviso_sistema: "ATENÇÃO IA: Não há vagas disponíveis para o período exato que o paciente solicitou. O sistema realizou uma busca estendida e retornou as vagas mais próximas. Informe isso ao paciente gentilmente e ofereça estas novas opções."
          });
        }

        return NextResponse.json(result);
      }

      case "BOOK_SLOT":
        return NextResponse.json(await bookSlotAction(
          payload.doctorId, payload.addressId, payload.slotStart, payload.bookingData
        ));

      case "CANCEL_BOOKING":
        return NextResponse.json(await cancelBookingAction(
          payload.doctorId, payload.addressId, payload.bookingId, payload.externalId
        ));

      case "GET_INSURANCES":
        return NextResponse.json(await fetchInsuranceProvidersAction());

      case "GET_DOCTOR":
        return NextResponse.json(await fetchSingleDoctorAction(payload.doctorId));

      case "GET_DOCTORS":
        return NextResponse.json(await fetchDoctorsAction());

      // --- CONSULTAR AGENDAMENTOS ESPECÍFICOS DO PACIENTE ---
      case "GET_BOOKINGS":
        return NextResponse.json(await fetchPatientBookingsAction(
          payload.doctorId,
          payload.addressId,
          payload.patientId,
          payload.startDate,
          payload.endDate
        ));

      // --- CONSULTAR TODOS AGENDAMENTOS POR CPF ---
      case "GET_BOOKINGS_BY_CPF":
        return NextResponse.json(await fetchBookingsByNINAction(
          payload.nin,
          payload.birthday,
          payload.doctorId,
          payload.addressId // <-- ADICIONADO AQUI
        ));

      // --- NOVA ROTA: SALVAR SOLICITAÇÃO DE RECEITA ---
      case "CREATE_PRESCRIPTION":
        return NextResponse.json(await createPrescriptionRequestAction(payload));

      // --- PERSONALIDADE DA IA + MÉDICO CONFIGURADO ---
      case "GET_PERSONALITY":
        return NextResponse.json(await loadRagAction());

      default:
        return NextResponse.json({ success: false, error: `Action '${action}' not supported.` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[N8N Webhook Error]:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
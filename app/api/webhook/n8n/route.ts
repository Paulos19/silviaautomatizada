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
        // 1. Pega a data inicial enviada pela IA (ou a data de hoje como fallback)
        const startDateObj = new Date(payload.startDate || new Date());

        // 2. Soma exatamente 90 dias para criar a data limite
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(endDateObj.getDate() + 90);

        // 3. Formata de volta para YYYY-MM-DD
        const calculatedEndDate = endDateObj.toISOString().split('T')[0];

        // 4. Chama a action forçando a janela de 90 dias
        return NextResponse.json(await fetchFreeSlotsAction(
          payload.doctorId,
          payload.addressId,
          payload.startDate,
          calculatedEndDate
        ));
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
          payload.birthday
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
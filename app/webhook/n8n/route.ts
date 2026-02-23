import { NextResponse } from "next/server";
import { 
  checkPatientExistsAction, 
  createPatientAction, 
  fetchFreeSlotsAction, 
  bookSlotAction, 
  cancelBookingAction,
  fetchInsuranceProvidersAction,
  fetchSingleDoctorAction
} from "@/actions/clinic.actions";

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
        
      case "GET_SLOTS":
        return NextResponse.json(await fetchFreeSlotsAction(
          payload.doctorId, payload.addressId, payload.startDate, payload.endDate
        ));
        
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

      default:
        return NextResponse.json({ success: false, error: `Action '${action}' not supported.` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[N8N Webhook Error]:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
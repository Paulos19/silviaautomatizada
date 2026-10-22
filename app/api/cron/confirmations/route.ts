import { NextResponse } from "next/server";
import {
  runMorningConfirmationDispatchAction,
  runAfternoonConfirmationDispatchAction,
  cancelUnconfirmedAppointmentsAndNotifyWaitlistAction
} from "@/actions/confirmation.actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("secret");

    // Validação opcional de chave secreta para segurança
    const expectedSecret = process.env.CRON_SECRET || process.env.N8N_WEBHOOK_SECRET;
    if (expectedSecret && key !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = searchParams.get("type"); // "morning", "afternoon", "cancellations" ou auto

    if (type === "morning") {
      const res = await runMorningConfirmationDispatchAction();
      return NextResponse.json(res);
    } else if (type === "afternoon") {
      const res = await runAfternoonConfirmationDispatchAction();
      return NextResponse.json(res);
    } else if (type === "cancellations") {
      const res = await cancelUnconfirmedAppointmentsAndNotifyWaitlistAction();
      return NextResponse.json(res);
    }

    // Auto-detecção com base no horário local de São Paulo
    const nowSp = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const currentHour = nowSp.getHours();

    if (currentHour >= 15 && currentHour <= 18) {
      const res = await runAfternoonConfirmationDispatchAction();
      return NextResponse.json({ routine: "afternoon_16h", ...res });
    } else {
      const res = await runMorningConfirmationDispatchAction();
      return NextResponse.json({ routine: "morning_08h", ...res });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro no cron de confirmações" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}

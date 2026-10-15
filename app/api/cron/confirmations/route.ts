import { NextResponse } from "next/server";
import { runMorningConfirmationDispatchAction } from "@/actions/confirmation.actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("secret");

    // Validação opcional de chave secreta para segurança
    const expectedSecret = process.env.CRON_SECRET || process.env.N8N_WEBHOOK_SECRET;
    if (expectedSecret && key !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await runMorningConfirmationDispatchAction();
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro no cron de confirmações" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}

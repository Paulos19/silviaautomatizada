import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SINGLETON_KEY = "default";

// GET /api/rag — Endpoint público para o n8n consumir a personalidade da IA
export async function GET(req: NextRequest) {
    // Validação por header secret (mesma lógica do webhook n8n)
    const secret = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret");
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const record = await prisma.aiPersonality.findUnique({
            where: { key: SINGLETON_KEY },
        });

        if (!record) {
            return NextResponse.json({
                ragPrompt: "",
                doctor: null,
                updatedAt: null,
            });
        }

        return NextResponse.json({
            ragPrompt: record.ragPrompt,
            doctor: record.doctorId ? {
                id: record.doctorId,
                name: record.doctorName,
                crm: record.doctorCrm,
                specialty: record.doctorSpecialty,
            } : null,
            updatedAt: record.updatedAt.toISOString(),
        });
    } catch (error: any) {
        console.error("[RAG API Error]", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

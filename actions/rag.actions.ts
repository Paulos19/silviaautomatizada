"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const SINGLETON_KEY = "default";

export async function saveRagAction(ragPrompt: string, doctor?: {
    id: number;
    name: string;
    crm?: number | null;
    specialty?: string | null;
} | null) {
    let userId = "system";
    try {
        const session = await auth();
        if (session?.user?.id) {
            userId = session.user.id;
        }
    } catch (e) {
        console.warn("[RAG] Sessão não disponível, salvando como system.");
    }

    try {
        await prisma.aiPersonality.upsert({
            where: { key: SINGLETON_KEY },
            update: {
                ragPrompt,
                doctorId: doctor?.id ?? null,
                doctorName: doctor?.name ?? null,
                doctorCrm: doctor?.crm ?? null,
                doctorSpecialty: doctor?.specialty ?? null,
                updatedBy: userId,
            },
            create: {
                key: SINGLETON_KEY,
                ragPrompt,
                doctorId: doctor?.id ?? null,
                doctorName: doctor?.name ?? null,
                doctorCrm: doctor?.crm ?? null,
                doctorSpecialty: doctor?.specialty ?? null,
                updatedBy: userId,
            },
        });
        console.log("[RAG] Salvo com sucesso no banco.");
        return { success: true };
    } catch (error: any) {
        console.error("[RAG Save Error]", error.message);
        return { success: false, error: "Falha ao salvar personalidade da IA." };
    }
}

export async function loadRagAction() {
    try {
        const record = await prisma.aiPersonality.findUnique({
            where: { key: SINGLETON_KEY },
        });
        if (!record) return { success: true, data: null };
        return {
            success: true,
            data: {
                ragPrompt: record.ragPrompt,
                doctorId: record.doctorId,
                doctorName: record.doctorName,
                doctorCrm: record.doctorCrm,
                doctorSpecialty: record.doctorSpecialty,
                updatedAt: record.updatedAt.toISOString(),
            },
        };
    } catch (error: any) {
        console.error("[RAG Load Error]", error.message);
        return { success: false, error: "Falha ao carregar personalidade da IA." };
    }
}

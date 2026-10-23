"use server";

import prisma from "@/lib/prisma";
import { ClinicService } from "@/services/clinic.service";

export async function getDashboardMetricsAction() {
    try {
        // Fetch doctors, insurances, and AI personality count
        // Note: Raw patient list polling removed to prevent heavy SELECT queries on Clinic database
        const [doctorsRes, insurancesRes, aiCount] = await Promise.all([
            ClinicService.getDoctors().catch(() => ({ result: { items: [] } })),
            ClinicService.getInsuranceProviders().catch(() => ({ result: { items: [] } })),
            prisma.aiPersonality.count().catch(() => 0),
        ]);

        const doctors = doctorsRes.result?.items || [];
        const insurances = insurancesRes.result?.items || [];
        const recentPatients: { id: number; name: string }[] = [];

        // Group doctors by specialty
        const specialtyMap = new Map<string, number>();
        for (const doc of doctors) {
            const spec = doc.specialty?.trim() || "Sem Especialidade";
            specialtyMap.set(spec, (specialtyMap.get(spec) || 0) + 1);
        }
        const doctorsBySpecialty = Array.from(specialtyMap.entries())
            .map(([specialty, count]) => ({ specialty, count }))
            .sort((a, b) => b.count - a.count);

        // Insurance providers list
        const insuranceProviders = insurances
            .filter((ins) => ins.name)
            .map((ins) => ({ id: ins.id, name: ins.name || "Sem Nome" }));

        return {
            success: true,
            metrics: {
                activeDoctors: doctors.length,
                activeInsurances: insurances.length,
                activeAIs: aiCount,
            },
            doctorsBySpecialty,
            insuranceProviders,
            recentPatients,
            totalPatients: 0,
        };
    } catch (error) {
        console.error("Dashboard metrics error:", error);
        return {
            success: false,
            metrics: {
                activeDoctors: 0,
                activeInsurances: 0,
                activeAIs: 1,
            },
            doctorsBySpecialty: [],
            insuranceProviders: [],
            recentPatients: [],
            totalPatients: 0,
        };
    }
}

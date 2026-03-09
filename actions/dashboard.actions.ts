"use server";

import { PrismaClient } from "@prisma/client";
import { ClinicService } from "@/services/clinic.service";

const prisma = new PrismaClient();

export async function getDashboardMetricsAction() {
    try {
        // Fetch all data in parallel for performance
        const [doctorsRes, insurancesRes, aiCount, patientsRes] = await Promise.all([
            ClinicService.getDoctors(),
            ClinicService.getInsuranceProviders(),
            prisma.aiPersonality.count(),
            ClinicService.getPatients(undefined, 1, 20),
        ]);

        const doctors = doctorsRes.result?.items || [];
        const insurances = insurancesRes.result?.items || [];
        const patients = patientsRes.result?.items || [];

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

        // Recent patients
        const recentPatients = patients
            .filter((p) => p.name)
            .slice(0, 10)
            .map((p) => ({ id: p.id, name: p.name || "Sem Nome" }));

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
            totalPatients: patients.length,
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

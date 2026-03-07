"use server";

import { PrismaClient } from "@prisma/client";
import { ClinicService } from "@/services/clinic.service";

const prisma = new PrismaClient();

export async function getDashboardMetricsAction() {
    try {
        const doctorsRes = await ClinicService.getDoctors();
        const activeDoctorsCount = doctorsRes.result?.items?.length || 0;

        const insurancesRes = await ClinicService.getInsuranceProviders();
        const activeInsurancesCount = insurancesRes.result?.items?.length || 0;

        const aiCount = await prisma.aiPersonality.count();

        return {
            success: true,
            metrics: {
                activeDoctors: activeDoctorsCount,
                activeInsurances: activeInsurancesCount,
                activeAIs: aiCount,
            }
        };
    } catch (error) {
        console.error("Dashboard metrics error:", error);
        return {
            success: false,
            metrics: {
                activeDoctors: 0,
                activeInsurances: 0,
                activeAIs: 1,
            }
        };
    }
}

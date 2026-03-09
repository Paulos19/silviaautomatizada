import { PremiumAnalytics } from "@/components/dashboard/PremiumAnalytics";
import { getDashboardMetricsAction } from "@/actions/dashboard.actions";
import { auth } from "@/auth";

export default async function DashboardOverview() {
  const response = await getDashboardMetricsAction();
  const metrics = response.metrics || { activeDoctors: 0, activeInsurances: 0, activeAIs: 0 };
  const doctorsBySpecialty = response.doctorsBySpecialty || [];
  const insuranceProviders = response.insuranceProviders || [];
  const recentPatients = response.recentPatients || [];
  const totalPatients = response.totalPatients || 0;

  const session = await auth();
  const userName = session?.user?.name || "Dr(a). Visitante";

  return (
    <div className="w-full">
      <PremiumAnalytics
        metrics={metrics}
        userName={userName}
        doctorsBySpecialty={doctorsBySpecialty}
        insuranceProviders={insuranceProviders}
        recentPatients={recentPatients}
        totalPatients={totalPatients}
      />
    </div>
  );
}
import { PremiumAnalytics } from "@/components/dashboard/PremiumAnalytics";
import { getDashboardMetricsAction } from "@/actions/dashboard.actions";
import { auth } from "@/auth";

export default async function DashboardOverview() {
  const response = await getDashboardMetricsAction();
  // Se houver falha na API, usa os valores zerados como fallback seguros
  const metrics = response.metrics || { activeDoctors: 0, activeInsurances: 0, activeAIs: 0 };

  const session = await auth();
  const userName = session?.user?.name || "Dr(a). Visitante";

  return (
    <div className="w-full">
      <PremiumAnalytics metrics={metrics} userName={userName} />
    </div>
  );
}
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { fetchDoctorsAction, fetchPatientsAction } from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  // 1. Validação de Sessão
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // 2. Busca de Debug (Apenas para fins de teste inicial)
  const doctorsRes = await fetchDoctorsAction();
  const patientsRes = await fetchPatientsAction();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel da Silvia</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {session.user?.name} ({session.user?.role})
          </p>
        </div>
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}>
          <Button variant="outline" type="submit">Sair</Button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Debug Médicos */}
        <div className="border rounded-lg p-4 bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Debug: Médicos (Clinic API)</h2>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs">
            {JSON.stringify(doctorsRes, null, 2)}
          </pre>
        </div>

        {/* Debug Pacientes */}
        <div className="border rounded-lg p-4 bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Debug: Pacientes (Clinic API)</h2>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs">
            {JSON.stringify(patientsRes, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
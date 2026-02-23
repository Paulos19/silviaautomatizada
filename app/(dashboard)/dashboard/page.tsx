import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DebugPanel } from "@/components/dashboard/debug-panel"; // Importamos o novo componente

export default async function DashboardPage() {
  // 1. Validação de Sessão
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

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

      {/* 2. Injetamos o painel de debug interativo */}
      <DebugPanel />
      
    </div>
  );
}
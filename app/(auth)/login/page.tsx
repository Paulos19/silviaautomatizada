import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acesso - Silvia Agent</CardTitle>
          <CardDescription>Acesse o painel administrativo.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Componente Client Isolado */}
          <LoginForm />
          
          <div className="mt-4 text-center text-sm">
            Não tem uma conta? <Link href="/register" className="underline">Cadastre-se</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
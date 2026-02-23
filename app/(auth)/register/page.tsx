import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cadastro - Silvia Agent</CardTitle>
          <CardDescription>Crie sua conta administrativa.</CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Componente Client Isolado */}
          <RegisterForm />

          <div className="mt-4 text-center text-sm">
            Já tem uma conta? <Link href="/login" className="underline">Faça login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
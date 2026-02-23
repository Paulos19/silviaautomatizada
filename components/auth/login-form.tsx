"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/actions/auth.actions";

export function LoginForm() {
  // useActionState é a API do React 19 para actions em formulários
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="admin@otorrinos.com.br" 
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          required 
          disabled={isPending}
        />
      </div>
      
      {/* Exibição de erro tratada */}
      {state?.error && (
        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Autenticando..." : "Entrar"}
      </Button>
    </form>
  );
}
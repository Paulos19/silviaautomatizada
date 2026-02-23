"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  // O React 19 / Next.js 15 exige o useActionState para forms que retornam dados/erros
  const [state, formAction, isPending] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input 
          id="name" 
          name="name" 
          required 
          placeholder="Seu nome" 
          disabled={isPending}
        />
      </div>
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
        {isPending ? "Cadastrando..." : "Cadastrar"}
      </Button>
    </form>
  );
}
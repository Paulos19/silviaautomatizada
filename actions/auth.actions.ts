"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

// Definimos o contrato de estado para nossos formulários
export type AuthState = {
  error?: string;
  success?: boolean;
};

/**
 * Action para Registro de Usuário
 * Assinatura compatível com useActionState (prevState, formData)
 */
export async function registerAction(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validação inicial
  if (!name || !email || !password) {
    return { error: "Todos os campos são obrigatórios." };
  }

  try {
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Este e-mail já está cadastrado." };
    }

    // Hash da senha (nunca armazenar em plain text)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Define a role baseado na variável de ambiente
    const isAdmin = email === process.env.ADMIN_EMAIL;

    // Persistência
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isAdmin ? "ADMIN" : "USER",
      },
    });

  } catch (error) {
    console.error("[Register Error]:", error);
    return { error: "Erro interno ao criar usuário. Tente novamente." };
  }

  // IMPORTANTE: O redirect() do Next.js lança um erro proposital por debaixo dos panos.
  // Por isso, ele DEVE ser chamado fora do bloco try/catch.
  redirect("/login");
}

/**
 * Action para Login de Usuário
 * Assinatura compatível com useActionState (prevState, formData)
 */
export async function loginAction(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha todos os campos." };
  }

  try {
    // O NextAuth fará o redirect automaticamente em caso de sucesso
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard", // Rota protegida do painel
    });
    
    return {}; // Apenas para satisfazer a tipagem, a execução não chega aqui em caso de sucesso
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas. Verifique seu e-mail e senha." };
        default:
          return { error: "Erro interno ao realizar login." };
      }
    }
    
    // IMPORTANTE: Erros de redirect do Next.js (lançados pelo signIn) devem ser propagados,
    // caso contrário a navegação falha silenciosamente.
    throw error;
  }
}
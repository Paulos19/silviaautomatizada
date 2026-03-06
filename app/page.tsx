import Image from "next/image";
import Link from "next/link";
import { Code2, Database, Layout, Server, Shield, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-16 px-8 bg-white dark:bg-black sm:items-start">

        {/* Next.js Default Hero Section */}
        <section className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mb-16 pt-8">
          <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a href="https://vercel.com/templates" className="font-medium text-zinc-950 dark:text-zinc-50">Templates</a>{" "}
            or the <a href="https://nextjs.org/learn" className="font-medium text-zinc-950 dark:text-zinc-50">Learning</a> center.
          </p>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full mt-4">
            <a className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]" href="https://vercel.com/new" target="_blank" rel="noopener noreferrer">
              <Image className="dark:invert" src="/vercel.svg" alt="Vercel logomark" width={16} height={16} /> Deploy Now
            </a>
            <a className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]" href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
          </div>
        </section>

        {/* --- About Section --- */}
        <div className="w-full h-px bg-border/50 my-10" />

        <section className="w-full space-y-8 pb-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Sobre Mim</h2>
            <p className="text-lg text-muted-foreground">
              Meu nome é <span className="font-semibold text-foreground">Paulo Henrique</span> e sou Desenvolvedor Fullstack.
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert">
            <p className="text-muted-foreground leading-relaxed">
              Atuo na criação de interfaces intuitivas e arquiteturas escaláveis. Meu foco principal é o desenvolvimento de soluções robustas de ponta a ponta.
            </p>
          </div>

          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-6">Habilidades e Tecnologias Atuais</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Frontend / UI */}
              <div className="p-5 rounded-xl border border-border/40 bg-card/50 shadow-sm flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0"><Layout className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Frontend & UI</h4>
                  <p className="text-xs text-muted-foreground">React 19, Next.js 16 (App Router), Tailwind CSS v4, Shadcn UI</p>
                </div>
              </div>

              {/* Backend / Server */}
              <div className="p-5 rounded-xl border border-border/40 bg-card/50 shadow-sm flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-chart-2/10 text-chart-2 shrink-0"><Server className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Backend & API</h4>
                  <p className="text-xs text-muted-foreground">Node.js, Next API Routes, Zod Validation</p>
                </div>
              </div>

              {/* Database / ORM */}
              <div className="p-5 rounded-xl border border-border/40 bg-card/50 shadow-sm flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-chart-1/10 text-chart-1 shrink-0"><Database className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Banco de Dados</h4>
                  <p className="text-xs text-muted-foreground">PostgreSQL, Prisma ORM Models & Migrations</p>
                </div>
              </div>

              {/* Segurança & Auth */}
              <div className="p-5 rounded-xl border border-border/40 bg-card/50 shadow-sm flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-chart-3/10 text-chart-3 shrink-0"><Shield className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Segurança</h4>
                  <p className="text-xs text-muted-foreground">NextAuth.js (v5), BcryptJS Hashing</p>
                </div>
              </div>

              {/* Core / Linguagem */}
              <div className="p-5 rounded-xl border border-border/40 bg-card/50 shadow-sm flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0"><Code2 className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Core & Tipagem</h4>
                  <p className="text-xs text-muted-foreground">TypeScript, Strict Mode, Interfaces e Types</p>
                </div>
              </div>

              {/* Mobile / PWA */}
              <div className="p-5 rounded-xl border border-border/40 bg-card/50 shadow-sm flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0"><Smartphone className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Responsividade</h4>
                  <p className="text-xs text-muted-foreground">Mobile First moderno com Tailwind</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
              Acessar Painel →
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}

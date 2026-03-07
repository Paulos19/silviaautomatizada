import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Fingerprint, IdCard } from "lucide-react";
import { AnimatedGlitterBackground } from "@/components/ui/animated-glitter-bg";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050C14] overflow-hidden p-4">
      {/* Background Particles Simulator & Glows (WebGL) */}
      <AnimatedGlitterBackground intensity={3.5} speed={0.8} />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-[#0B121D]/60 backdrop-blur-2xl border flex flex-col items-center border-teal-500/30 rounded-[35px] px-8 py-10 shadow-[0_0_50px_rgba(20,184,166,0.15)] overflow-hidden">

        {/* Subtle top edge glow trick */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50" />

        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative w-32 h-14 mb-2">
            <div className="absolute inset-0 bg-teal-400/20 blur-xl rounded-full animate-pulse" />
            <img src="/logo.png" alt="Silvia Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(20,184,166,0.6)] relative z-10" />
          </div>
        </div>

        {/* Header Titles */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-outfit text-white font-bold tracking-widest uppercase">Cadastro de Médica</h1>
          <p className="text-sm text-slate-400 font-inter mt-2">Crie seu Acesso ao Portal Seguro</p>
        </div>

        {/* Formulário */}
        <RegisterForm />

        {/* Divider */}
        <div className="w-full flex items-center justify-center gap-4 my-8 relative">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-xs text-slate-500 font-inter">Ou cadastre-se com:</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* Botões Secundários de Acesso */}
        <div className="grid grid-cols-3 gap-2 w-full mb-8">
          <button className="flex flex-col items-center justify-start gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-teal-500/50 group-hover:bg-teal-500/10 transition-all">
              <Fingerprint className="w-6 h-6 text-slate-400 group-hover:text-teal-400 transition-colors" />
            </div>
            <span className="text-[10px] text-slate-400 font-inter text-center leading-tight mt-1 group-hover:text-teal-300">Biometria<br />(Impres. Digital)</span>
          </button>

          <button className="flex flex-col items-center justify-start gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-teal-500/50 group-hover:bg-teal-500/10 transition-all">
              <svg className="w-6 h-6 text-slate-400 group-hover:text-teal-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-400 font-inter text-center leading-tight mt-1 group-hover:text-teal-300">Entrar com<br />o Google</span>
          </button>

          <button className="flex flex-col items-center justify-start gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-teal-500/50 group-hover:bg-teal-500/10 transition-all">
              <IdCard className="w-6 h-6 text-slate-400 group-hover:text-teal-400 transition-colors" />
            </div>
            <span className="text-[10px] text-slate-400 font-inter text-center leading-tight mt-1 group-hover:text-teal-300">ID do<br />Hospital</span>
          </button>
        </div>

        {/* Footer Link */}
        <Link href="/login" className="text-xs text-teal-500 font-inter hover:text-teal-400 hover:underline underline-offset-4 transition-all">
          Já tem uma conta? Faça login
        </Link>
      </div>
    </div>
  );
}
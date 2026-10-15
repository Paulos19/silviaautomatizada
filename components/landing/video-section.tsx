"use client";

import { cn } from "@/lib/utils";

export function VideoSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative w-full py-28 px-6 overflow-hidden bg-transparent flex flex-col justify-center items-center select-none",
        className
      )}
    >
      <div className="relative z-20 flex flex-col items-center text-center max-w-3xl mb-12">
        <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          [ DEMONSTRAÇÃO EM OPERAÇÃO ]
        </span>
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans tracking-tight text-slate-900 leading-tight mb-4">
          Construída para clínicas que pensam no futuro.
        </h3>
        <p className="text-base sm:text-lg font-sans font-light text-slate-600 max-w-xl leading-relaxed">
          Cada detalhe da Silvia foi desenhado para eliminar a fricção operacional e devolver tempo ao que mais importa: o cuidado com as pessoas.
        </p>
      </div>

      {/* Floating Video Theater Frame */}
      <div className="relative z-20 w-full max-w-5xl aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-950">
        <video
          src="/movies/Criação_de_Vídeo_Cinematográfico_de_Ensaio.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>
    </section>
  );
}

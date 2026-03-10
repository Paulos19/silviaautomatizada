"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function VideoSection({ className }: { className?: string }) {
    const containerRef = useRef<HTMLElement>(null);
    const videoWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (containerRef.current && videoWrapperRef.current) {
                        const { top, bottom, height } = containerRef.current.getBoundingClientRect();
                        const windowHeight = window.innerHeight;

                        if (top <= windowHeight && bottom >= 0) {
                            const totalDistance = windowHeight + height;
                            const scrolledDistance = windowHeight - top;
                            const progress = Math.max(0, Math.min(scrolledDistance / totalDistance, 1));
                            const maxOffset = height * 0.2;
                            const offset = (progress - 0.5) * maxOffset;
                            videoWrapperRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.1)`;
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className={cn("relative w-full h-screen overflow-hidden bg-black flex flex-col justify-center items-center select-none", className)}
        >
            {/* Parallax Video */}
            <div
                ref={videoWrapperRef}
                className="absolute inset-0 w-full h-full will-change-transform"
            >
                <video
                    src="/movies/Criação_de_Vídeo_Cinematográfico_de_Ensaio.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-10" />

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-3xl">
                <p className="text-[11px] font-inter font-medium uppercase tracking-[0.2em] text-teal-400/60 mb-8">
                    Produto
                </p>
                <h3 className="text-3xl md:text-5xl lg:text-[3.5rem] font-outfit font-extralight tracking-[-0.03em] text-white leading-[1.1] mb-6">
                    Construída para clínicas<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                        que pensam no futuro.
                    </span>
                </h3>
                <p className="text-base md:text-lg font-inter font-light text-white/30 max-w-xl leading-relaxed">
                    Cada detalhe da Silvia foi projetado para eliminar fricção operacional
                    e devolver tempo ao que importa: cuidar de pessoas.
                </p>

                {/* Decorative Line */}
                <div className="w-px h-20 bg-gradient-to-b from-white/20 to-transparent mt-12" />
            </div>
        </section>
    );
}

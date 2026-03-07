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

                        // Check if section is somewhat in viewport
                        if (top <= windowHeight && bottom >= 0) {
                            // Calculate progression (0 when hitting bottom of screen, 1 when leaving top)
                            const totalDistance = windowHeight + height;
                            const scrolledDistance = windowHeight - top;
                            const progress = Math.max(0, Math.min(scrolledDistance / totalDistance, 1));

                            // Parallax offset: shift the video slightly Y as we scroll
                            // Using a scale(1.1) to avoid showing edges when shifting
                            const maxOffset = height * 0.25; // 25% parallax intensity
                            const offset = (progress - 0.5) * maxOffset;

                            videoWrapperRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        // Setup inicial
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
            {/* Parallax Video Wrapper */}
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

            {/* Filtros Apple-style (Dark & Professional) */}
            {/* 1. Base Darkening */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />

            {/* 2. Vignette Premium (Bordas mais escuras voltando a atenção para o centro) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-10" />

            {/* Copywriting / Texto sobreposto (Opcional para dar a face) */}
            <div className="relative z-20 flex flex-col items-center text-center px-6 mix-blend-screen drop-shadow-[0_10px_20px_rgba(0,0,0,1)]">
                <h3 className="text-4xl md:text-6xl lg:text-7xl font-outfit font-light tracking-tight text-white mb-6">
                    A Excelência é Visível.
                </h3>
                <p className="text-lg md:text-2xl font-inter font-light text-slate-300 max-w-3xl">
                    Cada micro-interação, cada frame, focado 100% em engatar e converter pacientes de alto padrão.
                </p>

                {/* Linha Fina Decorativa Branca */}
                <div className="w-px h-24 bg-gradient-to-b from-white to-transparent mt-12 opacity-60" />
            </div>
        </section>
    );
}

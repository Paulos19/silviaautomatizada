"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ThreeLogoProps {
    className?: string;
    showText?: boolean;
}

/**
 * SilviaLogo (ThreeLogo)
 * Logomarca oficial baseada fielmente na Referência 2:
 * Cruz médica preta arredondada com estrela de 4 pontas (brilho/sparkle) vazada no centro,
 * acompanhada da tipografia geométrica premium "Silvia".
 */
export function ThreeLogo({ className, showText = true }: ThreeLogoProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href="/dashboard/orchestrator"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "flex items-center gap-2.5 sm:gap-3 group select-none shrink-0 transition-transform duration-200 hover:opacity-90",
                className
            )}
            title="Silvia • Hospital Otorrinos Curitiba"
        >
            {/* Ícone da Cruz com Estrela / Sparkle (Fiel à Referência 2) */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
                <svg
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
                >
                    {/* Cruz Médica com Pontas Arredondadas (Pill shape) */}
                    <g fill="#1E2022">
                        {/* Braço Horizontal */}
                        <rect x="3" y="13" width="30" height="10" rx="5" />
                        {/* Braço Vertical */}
                        <rect x="13" y="3" width="10" height="30" rx="5" />
                    </g>

                    {/* Estrela de 4 Pontas (Sparkle vazado no centro com brilho branco puro) */}
                    <path
                        d="M 18 6.5 C 18 13.5 14 18 6.5 18 C 14 18 18 22.5 18 29.5 C 18 22.5 22 18 29.5 18 C 22 18 18 13.5 18 6.5 Z"
                        fill="#FFFFFF"
                        className={cn(
                            "transition-all duration-300 origin-center",
                            isHovered ? "scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" : ""
                        )}
                        style={{ transformOrigin: "18px 18px" }}
                    />
                </svg>
            </div>

            {/* Tipografia Oficial Silvia (Referência 2) */}
            {showText && (
                <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-bold text-slate-900 text-xl sm:text-2xl tracking-[-0.03em] font-sans">
                        Silvia
                    </span>
                    <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#F2ECE0] text-slate-600 border border-[#E0D8C8]">
                        Curitiba
                    </span>
                </div>
            )}
        </Link>
    );
}

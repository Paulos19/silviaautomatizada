"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SvgSmartphoneMockupProps {
    children: React.ReactNode;
    className?: string;
    statusBarTime?: string;
    batteryLevel?: number;
}

/**
 * SvgSmartphoneMockup
 * Um chassi de smartphone ultra-realista construído com vetores SVG e acabamento em titânio grafite.
 * Projetado para proporções perfeitas sem transbordar a tela e sem gerar barras de rolagem horizontal.
 */
export function SvgSmartphoneMockup({
    children,
    className,
    statusBarTime = "12:01",
    batteryLevel = 98
}: SvgSmartphoneMockupProps) {
    return (
        <div className={cn("relative mx-auto flex items-center justify-center select-none py-1", className)}>
            {/* Halo sutil de iluminação âmbar */}
            <div className="absolute inset-2 bg-amber-400/10 blur-2xl rounded-full pointer-events-none -z-10" />

            {/* Chassi do Smartphone (Tamanho ergonômico 340px x 620px) */}
            <div className="relative w-[320px] sm:w-[350px] h-[610px] rounded-[48px] p-[9px] bg-gradient-to-b from-[#2e3238] via-[#1c1f24] to-[#121417] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.12),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-[#3b4047] z-10 flex flex-col overflow-hidden">
                
                {/* Botões Físicos Laterais Externos (SVG) */}
                <div className="absolute -left-[3px] top-[110px] w-[3px] h-[28px] bg-[#42474f] rounded-l-md" />
                <div className="absolute -left-[3px] top-[150px] w-[3px] h-[40px] bg-[#42474f] rounded-l-md" />
                <div className="absolute -left-[3px] top-[200px] w-[3px] h-[40px] bg-[#42474f] rounded-l-md" />
                <div className="absolute -right-[3px] top-[165px] w-[3px] h-[55px] bg-[#42474f] rounded-r-md" />

                {/* Top Notch / Dynamic Island */}
                <div className="absolute top-[14px] inset-x-0 flex justify-center items-center z-40 pointer-events-none">
                    <div className="h-[22px] w-[105px] bg-[#000000] rounded-full flex items-center justify-between px-3 shadow-[0_2px_8px_rgba(0,0,0,0.8)] border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-[#0a0d12] border border-[#1a1f26] flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-[#1b2b45]" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#050608]" />
                        </div>
                    </div>
                </div>

                {/* Barra de Status do Sistema Operacional */}
                <div className="absolute top-[12px] inset-x-0 px-6 flex justify-between items-center z-30 pointer-events-none text-[10px] font-semibold text-slate-700 tracking-tight">
                    <span>{statusBarTime}</span>
                    <div className="flex items-center gap-1.5 text-slate-700">
                        {/* Sinal */}
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm0 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" opacity="0.3" />
                            <path d="M18.36 5.64c-3.51-3.51-9.21-3.51-12.72 0l1.41 1.41c2.73-2.73 7.17-2.73 9.9 0l1.41-1.41z" />
                            <path d="M15.54 8.46c-1.95-1.95-5.12-1.95-7.07 0l1.41 1.41c1.17-1.17 3.08-1.17 4.24 0l1.42-1.41z" />
                            <circle cx="12" cy="14" r="1.5" />
                        </svg>
                        {/* Bateria */}
                        <div className="flex items-center gap-0.5">
                            <div className="w-4 h-2 rounded-[3px] border border-slate-700 p-[1px] flex items-center">
                                <div className="h-full bg-slate-800 rounded-[1.5px]" style={{ width: `${batteryLevel}%` }} />
                            </div>
                            <div className="w-[1px] h-1 bg-slate-700 rounded-r-sm" />
                        </div>
                    </div>
                </div>

                {/* Tela Interna do Smartphone */}
                <div className="relative w-full h-full bg-[#EFEAE2] rounded-[38px] overflow-hidden flex flex-col z-20 shadow-inner">
                    {children}
                </div>

                {/* Barra Home inferior */}
                <div className="absolute bottom-[12px] inset-x-0 flex justify-center items-center z-40 pointer-events-none">
                    <div className="w-28 h-1 rounded-full bg-slate-800/40 backdrop-blur-sm" />
                </div>
            </div>
        </div>
    );
}

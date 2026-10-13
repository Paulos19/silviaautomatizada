"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ThreePhoneFrameProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Smartphone Frame Estático e Realista (Fiel à Referência 2)
 * Sem inclinação no mouse, 100% frontal, estável e com acabamento de alta precisão.
 */
export function ThreePhoneFrame({ children, className }: ThreePhoneFrameProps) {
    return (
        <div
            className={cn(
                "relative w-full max-w-[390px] mx-auto flex items-center justify-center select-none py-2",
                className
            )}
        >
            {/* Sutil halo de iluminação estático atrás do smartphone */}
            <div className="absolute inset-10 bg-teal-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

            {/* Chassi Externo do Smartphone com botões laterais (Referência 2) */}
            <div className="relative w-[370px] h-[760px] rounded-[48px] p-[10px] bg-gradient-to-b from-[#2a2e33] via-[#1a1c1e] to-[#0f1113] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] border border-slate-700/80 z-10 overflow-hidden">
                {/* Botões Laterais Esquerda (Volume) */}
                <div className="absolute -left-[3px] top-[140px] w-[3px] h-[45px] bg-[#3a3f45] rounded-l-sm" />
                <div className="absolute -left-[3px] top-[195px] w-[3px] h-[45px] bg-[#3a3f45] rounded-l-sm" />

                {/* Botão Lateral Direita (Power) */}
                <div className="absolute -right-[3px] top-[160px] w-[3px] h-[60px] bg-[#3a3f45] rounded-r-sm" />

                {/* Alto-falante de chamada e Câmera Frontal (Punch-hole notch) */}
                <div className="absolute top-2.5 inset-x-0 flex justify-center items-center z-40 pointer-events-none">
                    <div className="flex items-center gap-2">
                        {/* Fenda de áudio superior */}
                        <div className="w-12 h-1 rounded-full bg-[#0a0c0e] border border-white/5" />
                    </div>
                </div>

                {/* Tela Interna do Smartphone (Área do WhatsApp) */}
                <div className="relative w-full h-full bg-[#EFEAE2] rounded-[38px] overflow-hidden flex flex-col z-20 shadow-inner">
                    {children}
                </div>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { AppHeaderbar } from "@/components/layout/AppHeaderbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ClinicSettingsProvider } from "@/components/dashboard/clinic-settings-context";

export default function OrchestratorLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClinicSettingsProvider>
            <div className="min-h-screen bg-[#FBF9F4] text-slate-800 relative selection:bg-amber-200/60 font-sans flex flex-col">
                
                {/* Ambient Radial Golden Glow (Inspirado fielmente na referência do usuário) */}
                <div className="fixed top-0 right-0 w-[700px] h-[600px] bg-gradient-to-bl from-amber-200/35 via-yellow-100/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
                <div className="fixed bottom-0 left-1/4 w-[500px] h-[400px] bg-gradient-to-tr from-amber-100/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

                {/* Headerbar Global Única (Sem Sidebar) */}
                <AppHeaderbar />

                {/* Área de Conteúdo com Transição Suave */}
                <main className="flex-1 w-full relative z-10 px-4 sm:px-6 lg:px-10 py-6">
                    <div className="mx-auto max-w-[1680px]">
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </div>
                </main>
            </div>
        </ClinicSettingsProvider>
    );
}

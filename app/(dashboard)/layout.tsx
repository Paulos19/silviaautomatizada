"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ClinicSettingsProvider } from "@/components/dashboard/clinic-settings-context";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AnimatedGlitterBackground } from "@/components/ui/animated-glitter-bg";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Começa fechado no telemóvel e aberto no desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Ajusta o estado inicial baseando-se no tamanho do ecrã após a montagem do componente
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <ClinicSettingsProvider>
      <div className="flex h-screen overflow-hidden bg-background/50 relative selection:bg-primary/20">

        {/* Animated Glitter Background */}
        <AnimatedGlitterBackground intensity={3.5} speed={0.8} />

        {/* Overlay Escuro para Telemóvel (Fecha a sidebar ao clicar) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-500 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar - Fixo na esquerda */}
        <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Área Principal */}
        <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden transition-all duration-500">

          {/* Mobile Hambuger Toggle Fixo no topo direito para caso de ecrã pequeno e sidebar fechada */}
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden absolute top-4 left-4 z-50 hover:bg-white/5"
            >
              <Menu className="w-6 h-6 text-slate-300" />
            </Button>
          )}

          {/* Conteúdo Dinâmico */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10 lg:p-14 xl:p-16 animate-in fade-in duration-700 slide-in-from-bottom-4 custom-scrollbar">
            <div className="mx-auto max-w-[1400px] pb-10 mt-10 md:mt-0">
              {children}
            </div>
          </div>

        </main>
      </div>
    </ClinicSettingsProvider>
  );
}


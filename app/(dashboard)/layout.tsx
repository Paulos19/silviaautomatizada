"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

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
    <div className="flex h-screen overflow-hidden bg-background relative selection:bg-primary/20">
      {/* Brilho majestoso de fundo */}
      <div className="ambient-bg" />

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
        
        {/* Header no topo */}
        <DashboardHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-700 slide-in-from-bottom-4 custom-scrollbar">
          <div className="mx-auto max-w-7xl pb-10">
            {children}
          </div>
        </div>
        
      </main>
    </div>
  );
}
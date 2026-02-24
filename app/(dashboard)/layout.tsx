"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* O brilho majestoso de fundo que criamos no CSS */}
      <div className="ambient-bg" />

      {/* Sidebar - Fixo na esquerda */}
      <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Área Principal */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* Header no topo */}
        <DashboardHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Conteúdo Dinâmico com Fade In */}
        <div className="flex-1 overflow-auto p-6 md:p-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
        
      </main>
    </div>
  );
}
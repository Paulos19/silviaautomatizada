"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveWeather } from "./live-weather";

export function DashboardHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time?.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
  const seconds = time?.getSeconds().toString().padStart(2, '0');
  const formattedDate = time?.toLocaleDateString("pt-BR", { weekday: 'short', day: 'numeric', month: 'short' }); // Encurtado para caber no telemóvel

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-6 
                       bg-card/40 backdrop-blur-3xl border-b border-border/30 shadow-sm transition-all w-full">

      {/* Esquerda */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden shrink-0">
          <Menu className="w-6 h-6 text-foreground/80" />
        </Button>
        <div className="hidden lg:flex relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
          <Input
            placeholder="Buscar..."
            className="w-48 xl:w-64 pl-10 bg-background/50 backdrop-blur-md border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-background focus-visible:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all rounded-full h-10"
          />
        </div>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-3 md:gap-6">

        {/* Clima - Widget Dinâmico */}
        <LiveWeather />

        {/* Relógio */}
        <div className="flex flex-col items-end min-w-[70px]">
          <div className="flex items-baseline font-outfit text-primary drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]">
            <span className="text-xl md:text-2xl font-bold tracking-tighter">{formattedTime || "00:00"}</span>
            <span className="text-xs md:text-sm font-medium text-muted-foreground animate-pulse ml-0.5">:{seconds || "00"}</span>
          </div>
          <span className="text-[10px] md:text-xs font-medium font-inter text-muted-foreground capitalize whitespace-nowrap">
            {formattedDate || "..."}
          </span>
        </div>

        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative rounded-full shrink-0 h-10 w-10 hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-foreground/80" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        </Button>
      </div>
    </header>
  );
}
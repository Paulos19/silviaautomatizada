"use client";

import { useEffect, useState } from "react";
import { Sun, CloudRain, Snowflake, ThermometerSun, Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WeatherType = "sunny" | "rainy" | "cold" | "hot";

export function DashboardHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [time, setTime] = useState<Date | null>(null);
  
  // Simulando uma API de Clima (Você pode plugar a API do OpenWeather aqui depois)
  const [weather, setWeather] = useState<WeatherType>("sunny");

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Formatação majestosa do tempo
  const formattedTime = time?.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
  const seconds = time?.getSeconds().toString().padStart(2, '0');
  const formattedDate = time?.toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' });

  // Renderizador Animado do Clima
  const renderWeather = () => {
    switch (weather) {
      case "sunny":
        return <Sun className="w-6 h-6 text-yellow-500 animate-sun-spin" />;
      case "rainy":
        return (
          <div className="relative flex items-center justify-center w-6 h-6">
            <CloudRain className="w-6 h-6 text-blue-400 absolute z-10" />
            <div className="w-1 h-1 bg-blue-300 rounded-full absolute bottom-0 left-1 animate-rain-drop" />
            <div className="w-1 h-1 bg-blue-300 rounded-full absolute bottom-0 right-1 animate-rain-drop-delayed" />
          </div>
        );
      case "cold":
        return <Snowflake className="w-6 h-6 text-cyan-300 animate-snow-float" />;
      case "hot":
        return <ThermometerSun className="w-6 h-6 text-orange-500 animate-heat-wave" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-20 px-6 
                       bg-background/60 backdrop-blur-xl border-b border-border/50 shadow-sm transition-all">
      
      {/* Esquerda: Botão Menu Mobile e Busca */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar pacientes..." 
            className="w-64 pl-9 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:bg-background transition-all rounded-full"
          />
        </div>
      </div>

      {/* Direita: Relógio, Clima e Perfil */}
      <div className="flex items-center gap-6">
        
        {/* Widget de Clima */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/40 rounded-full border border-border/50 cursor-pointer hover:bg-muted/60 transition-colors"
             onClick={() => setWeather(w => w === "sunny" ? "rainy" : w === "rainy" ? "cold" : w === "cold" ? "hot" : "sunny")}
             title="Clique para testar as animações">
          {renderWeather()}
          <span className="text-sm font-medium tracking-wide">
            {weather === "sunny" ? "28°C Sol" : weather === "rainy" ? "19°C Chuva" : weather === "cold" ? "12°C Frio" : "34°C Calor"}
          </span>
        </div>

        {/* Relógio Majestoso */}
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1 font-mono text-primary">
            <span className="text-2xl font-bold tracking-tighter">{formattedTime || "00:00"}</span>
            <span className="text-sm font-medium text-muted-foreground animate-pulse">:{seconds || "00"}</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {formattedDate || "Carregando..."}
          </span>
        </div>

        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="w-5 h-5 text-foreground/80" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />
        </Button>
      </div>
    </header>
  );
}
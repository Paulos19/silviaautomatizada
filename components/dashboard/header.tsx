"use client";

import { useEffect, useState } from "react";
import { Sun, CloudRain, Snowflake, ThermometerSun, Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WeatherType = "sunny" | "rainy" | "cold" | "hot";

export function DashboardHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherType>("sunny");

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time?.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
  const seconds = time?.getSeconds().toString().padStart(2, '0');
  const formattedDate = time?.toLocaleDateString("pt-BR", { weekday: 'short', day: 'numeric', month: 'short' }); // Encurtado para caber no telemóvel

  const renderWeather = () => {
    switch (weather) {
      case "sunny": return <Sun className="w-5 h-5 text-yellow-500 animate-sun-spin" />;
      case "rainy": return (
          <div className="relative flex items-center justify-center w-5 h-5">
            <CloudRain className="w-5 h-5 text-blue-400 absolute z-10" />
            <div className="w-1 h-1 bg-blue-300 rounded-full absolute bottom-0 left-0.5 animate-rain-drop" />
            <div className="w-1 h-1 bg-blue-300 rounded-full absolute bottom-0 right-0.5 animate-rain-drop-delayed" />
          </div>
        );
      case "cold": return <Snowflake className="w-5 h-5 text-cyan-300 animate-snow-float" />;
      case "hot": return <ThermometerSun className="w-5 h-5 text-orange-500 animate-heat-wave" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-6 
                       bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm transition-all w-full">
      
      {/* Esquerda */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden shrink-0">
          <Menu className="w-6 h-6 text-foreground/80" />
        </Button>
        <div className="hidden lg:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar..." 
            className="w-48 xl:w-64 pl-9 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:bg-background transition-all rounded-full h-9"
          />
        </div>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Clima - Escondido em ecrãs muito pequenos (mobile portrait) */}
        <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-muted/40 rounded-full border border-border/50 cursor-pointer hover:bg-muted/60 transition-colors"
             onClick={() => setWeather(w => w === "sunny" ? "rainy" : w === "rainy" ? "cold" : w === "cold" ? "hot" : "sunny")}>
          {renderWeather()}
          <span className="text-xs md:text-sm font-medium tracking-wide whitespace-nowrap">
            {weather === "sunny" ? "28°C" : weather === "rainy" ? "19°C" : weather === "cold" ? "12°C" : "34°C"}
          </span>
        </div>

        {/* Relógio */}
        <div className="flex flex-col items-end min-w-[70px]">
          <div className="flex items-baseline font-mono text-primary">
            <span className="text-xl md:text-2xl font-bold tracking-tighter">{formattedTime || "00:00"}</span>
            <span className="text-xs md:text-sm font-medium text-muted-foreground animate-pulse ml-0.5">:{seconds || "00"}</span>
          </div>
          <span className="text-[10px] md:text-xs font-medium text-muted-foreground capitalize whitespace-nowrap">
            {formattedDate || "..."}
          </span>
        </div>

        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative rounded-full shrink-0 h-9 w-9 md:h-10 md:w-10">
          <Bell className="w-5 h-5 md:w-5 md:h-5 text-foreground/80" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
        </Button>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutDashboard, CalendarDays, Users, Stethoscope, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function DashboardSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
    { icon: CalendarDays, label: "Agendamentos", href: "/dashboard/bookings" },
    { icon: Users, label: "Pacientes", href: "/dashboard/patients" },
    { icon: Stethoscope, label: "Corpo Clínico", href: "/dashboard/doctors" },
  ];

  return (
    <aside 
      className={cn(
        "relative h-screen bg-card/60 backdrop-blur-2xl border-r border-border/50 flex flex-col transition-[width] duration-500 ease-in-out z-50",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Botão Retrátil */}
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-4 top-6 w-8 h-8 rounded-full shadow-md bg-background hover:bg-accent border-border/50 hidden md:flex"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-border/50 px-4">
        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center shadow-lg transition-all duration-300", 
                          !isOpen && "scale-90")}>
          <span className="text-primary-foreground font-bold text-xl">S</span>
        </div>
        {isOpen && (
          <span className="ml-3 font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 whitespace-nowrap overflow-hidden animate-in fade-in zoom-in duration-500">
            Silvia AI
          </span>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-hidden">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center h-12 rounded-xl transition-all duration-300 group cursor-pointer",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                isOpen ? "px-4" : "justify-center"
              )}>
                <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive && "fill-primary/20")} />
                {isOpen && (
                  <span className="ml-3 font-medium text-sm whitespace-nowrap animate-in fade-in duration-300">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <div className={cn("flex items-center h-12 rounded-xl text-muted-foreground hover:bg-muted/50 cursor-pointer transition-all", isOpen ? "px-4" : "justify-center")}>
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          {isOpen && <span className="ml-3 font-medium text-sm">Configurações</span>}
        </div>
        <div className={cn("flex items-center h-12 rounded-xl text-destructive hover:bg-destructive/10 cursor-pointer transition-all", isOpen ? "px-4" : "justify-center")}>
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="ml-3 font-medium text-sm">Sair</span>}
        </div>
      </div>
    </aside>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
        "fixed inset-y-0 left-0 md:relative h-screen bg-card/40 md:bg-card/30 backdrop-blur-3xl border-r border-border/30 flex flex-col transition-all duration-500 ease-in-out z-50",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20"
      )}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-4 top-6 w-8 h-8 rounded-full shadow-lg bg-background/80 backdrop-blur-md hover:bg-accent border-border/50 hidden md:flex z-50 transition-all duration-300 hover:scale-110"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-primary" />}
      </Button>

      <div className="h-24 flex items-center justify-center border-b border-border/30 px-4">
        <div className={cn("relative flex items-center justify-center transition-all duration-500", isOpen ? "w-32 h-14" : "w-12 h-12 md:scale-90")}>
          <div className="absolute inset-0 bg-teal-400/20 blur-md rounded-full" />
          <img
            src={isOpen ? "/logo.png" : "/logo-retraida.png"}
            alt="Silvia Logo"
            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(20,184,166,0.5)] relative z-10 p-0.5"
          />
        </div>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-3 overflow-hidden overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => {
              if (window.innerWidth < 768) setIsOpen(false);
            }}>
              <div className={cn(
                "flex items-center h-12 rounded-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(20,184,166,0.15)] ring-1 ring-primary/30"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                isOpen ? "px-4" : "justify-center"
              )}>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn("w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]", isActive && "fill-primary/20 text-primary drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]")} />
                <span className={cn(
                  "ml-3 font-medium font-inter text-sm whitespace-nowrap transition-all duration-300",
                  isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/30 space-y-3 mt-auto mb-4">
        <Link href="/dashboard/settings" onClick={() => {
          if (window.innerWidth < 768) setIsOpen(false);
        }}>
          <div className={cn(
            "flex items-center h-12 rounded-2xl transition-all duration-300 group cursor-pointer",
            pathname === "/dashboard/settings"
              ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(20,184,166,0.15)] ring-1 ring-primary/30"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            isOpen ? "px-4" : "justify-center"
          )}>
            <Settings className={cn("w-5 h-5 shrink-0 transition-all duration-500 group-hover:rotate-90 group-hover:text-primary", pathname === "/dashboard/settings" && "fill-primary/20 text-primary")} />
            <span className={cn("ml-3 font-medium font-inter text-sm whitespace-nowrap transition-all duration-300", isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>Configurações</span>
          </div>
        </Link>
        <div
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn("flex items-center h-12 rounded-2xl text-destructive hover:bg-destructive/15 cursor-pointer transition-all duration-300 group", isOpen ? "px-4" : "justify-center")}
        >
          <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
          <span className={cn("ml-3 font-medium font-inter text-sm whitespace-nowrap transition-all duration-300", isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>Sair</span>
        </div>
      </div>
    </aside>
  );
}
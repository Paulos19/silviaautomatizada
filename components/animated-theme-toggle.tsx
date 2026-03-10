"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function AnimatedThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className={cn("h-12 rounded-2xl", collapsed ? "w-12" : "w-full")} />;

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "relative flex items-center h-12 rounded-2xl transition-all duration-500 group cursor-pointer overflow-hidden",
                isDark
                    ? "bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700",
                collapsed ? "justify-center w-full" : "px-4 w-full"
            )}
            aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
        >
            {/* Animated Icon Container */}
            <div className="relative w-5 h-5 shrink-0">

                {/* Sun */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                        "absolute inset-0 w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isDark
                            ? "opacity-0 rotate-90 scale-0"
                            : "opacity-100 rotate-0 scale-100"
                    )}
                >
                    <circle cx="12" cy="12" r="4" />
                    {/* Rays - animated with stagger via CSS */}
                    <line x1="12" y1="2" x2="12" y2="5" className="origin-center" />
                    <line x1="12" y1="19" x2="12" y2="22" className="origin-center" />
                    <line x1="4.93" y1="4.93" x2="7.07" y2="7.07" className="origin-center" />
                    <line x1="16.93" y1="16.93" x2="19.07" y2="19.07" className="origin-center" />
                    <line x1="2" y1="12" x2="5" y2="12" className="origin-center" />
                    <line x1="19" y1="12" x2="22" y2="12" className="origin-center" />
                    <line x1="4.93" y1="19.07" x2="7.07" y2="16.93" className="origin-center" />
                    <line x1="16.93" y1="7.07" x2="19.07" y2="4.93" className="origin-center" />
                </svg>

                {/* Moon */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                        "absolute inset-0 w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isDark
                            ? "opacity-100 rotate-0 scale-100"
                            : "opacity-0 -rotate-90 scale-0"
                    )}
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </div>

            {/* Label */}
            <span className={cn(
                "ml-3 font-medium font-inter text-sm whitespace-nowrap transition-all duration-300",
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}>
                {isDark ? "Tema Claro" : "Tema Escuro"}
            </span>

            {/* Animated pill indicator */}
            <div className={cn(
                "ml-auto transition-all duration-300",
                collapsed ? "hidden" : "block"
            )}>
                <div className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-colors duration-500",
                    isDark ? "bg-white/10" : "bg-amber-200"
                )}>
                    <div className={cn(
                        "w-4 h-4 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm",
                        isDark
                            ? "translate-x-0 bg-slate-400"
                            : "translate-x-4 bg-amber-500"
                    )} />
                </div>
            </div>
        </button>
    );
}

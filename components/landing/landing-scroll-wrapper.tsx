"use client";

import { ReactNode } from "react";

export function LandingScrollWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen font-sans bg-transparent text-slate-900 selection:bg-amber-500/20">
      {children}
    </div>
  );
}

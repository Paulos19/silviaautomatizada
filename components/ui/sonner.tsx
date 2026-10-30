"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Sparkles, Loader2, X } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      richColors={false}
      gap={10}
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
        error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
        warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
        info: <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />,
        loading: <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />,
        close: <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 transition-colors" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-2xl border px-4 py-3.5 shadow-[0_14px_38px_rgba(0,0,0,0.12)] flex items-center gap-3 backdrop-blur-md transition-all text-xs font-medium border-[#E8E2D6] bg-[#FAF7F0] text-slate-900 dark:bg-[#1E2022] dark:border-white/10 dark:text-slate-100",
          title: "font-semibold text-xs tracking-tight text-slate-900 dark:text-white leading-snug",
          description: "text-slate-600 dark:text-slate-400 text-[11px] font-normal leading-relaxed mt-0.5",
          actionButton:
            "bg-[#1E2022] hover:bg-black text-white dark:bg-white dark:text-slate-900 font-semibold rounded-xl text-xs px-3 py-1.5 transition-colors cursor-pointer shadow-xs",
          cancelButton:
            "bg-[#F4EFE6] text-slate-700 hover:bg-[#EAE4D7] dark:bg-white/10 dark:text-slate-200 font-semibold rounded-xl text-xs px-3 py-1.5 transition-colors cursor-pointer",
          closeButton:
            "border border-[#E8E2D6] bg-white text-slate-500 hover:text-slate-900 hover:bg-[#F4EFE6] dark:bg-[#1E2022] dark:border-white/10 dark:text-slate-400 rounded-lg p-1 transition-all cursor-pointer shadow-2xs",
          success:
            "!border-emerald-300/80 !bg-emerald-50/95 !text-emerald-950 dark:!bg-emerald-950/60 dark:!border-emerald-500/40 dark:!text-emerald-100",
          error:
            "!border-rose-300/80 !bg-rose-50/95 !text-rose-950 dark:!bg-rose-950/60 dark:!border-rose-500/40 dark:!text-rose-100",
          warning:
            "!border-amber-300/80 !bg-amber-50/95 !text-amber-950 dark:!bg-amber-950/60 dark:!border-amber-500/40 dark:!text-amber-100",
          info:
            "!border-teal-300/80 !bg-teal-50/95 !text-teal-950 dark:!bg-teal-950/60 dark:!border-teal-500/40 dark:!text-teal-100",
        },
      }}
      {...props}
    />
  );
}

export { toast };


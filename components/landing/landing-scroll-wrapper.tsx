"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

export function LandingScrollWrapper({ children }: { children: ReactNode }) {
    const { scrollYProgress } = useScroll();

    // Transition background from slate-50 to zinc-950
    // Adjust the range so the dive happens around 40-60% of scroll
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.4, 0.6, 1],
        ["#f8fafc", "#f8fafc", "#09090b", "#09090b"]
    );

    return (
        <motion.div
            style={{ backgroundColor }}
            className="flex flex-col min-h-screen font-sans selection:bg-teal-500/30 transition-colors duration-200"
        >
            {children}
        </motion.div>
    );
}

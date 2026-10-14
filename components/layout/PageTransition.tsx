"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * PageTransition
 * Proporciona transições de página ultra-suaves e elegantes (Framer Motion)
 * sem flashes ou quebras durante a navegação entre rotas da aplicação.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

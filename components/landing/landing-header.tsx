"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const navLinks = [
    { label: "Funções", href: "#features" },
    { label: "Produto", href: "#about" },
    { label: "Contato", href: "#contact" },
];

export function LandingHeader() {
    const { scrollYProgress } = useScroll();

    // Map scroll progress to colors
    const navBg = useTransform(
        scrollYProgress,
        [0, 0.4, 0.6, 1],
        ["rgba(255, 255, 255, 0.6)", "rgba(255, 255, 255, 0.6)", "rgba(255, 255, 255, 0.03)", "rgba(255, 255, 255, 0.03)"]
    );
    const navColor = useTransform(
        scrollYProgress,
        [0, 0.4, 0.6, 1],
        ["#475569", "#475569", "rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.5)"]
    );
    const navBorder = useTransform(
        scrollYProgress,
        [0, 0.4, 0.6, 1],
        ["rgba(226, 232, 240, 0.8)", "rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.06)"]
    );

    const ctaBg = useTransform(
        scrollYProgress,
        [0, 0.4, 0.6, 1],
        ["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.06)"]
    );
    const ctaColor = useTransform(
        scrollYProgress,
        [0, 0.4, 0.6, 1],
        ["#0f172a", "#0f172a", "rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.8)"]
    );

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 pointer-events-none">
            <div className="max-w-6xl mx-auto w-full flex items-center justify-between">

                {/* Logo */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-auto"
                >
                    <Link href="/" className="flex items-center group">
                        <div className="relative w-24 h-8 overflow-hidden">
                            {/* We could use contrast filters, but simply applying white logo with an invert filter during light theme works */}
                            <motion.img
                                style={{
                                    filter: useTransform(
                                        scrollYProgress,
                                        [0, 0.4, 0.6, 1],
                                        ["brightness(0) invert(0)", "brightness(0) invert(0)", "brightness(1) invert(1)", "brightness(1) invert(1)"]
                                    )
                                }}
                                src="/logo.png"
                                alt="Silvia"
                                className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                            />
                        </div>
                    </Link>
                </motion.div>

                {/* Center Nav */}
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="hidden md:flex items-center gap-1 backdrop-blur-2xl border px-2 py-1.5 rounded-full pointer-events-auto"
                    style={{ backgroundColor: navBg, borderColor: navBorder }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="relative group px-5 py-1.5 rounded-full text-[11px] font-inter font-medium tracking-[0.08em] transition-all duration-500"
                        >
                            <motion.span style={{ color: navColor }} className="group-hover:opacity-80">
                                {link.label}
                            </motion.span>
                        </Link>
                    ))}
                </motion.nav>

                {/* CTA */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-auto"
                >
                    <Link href="/login">
                        <motion.div
                            style={{ backgroundColor: ctaBg, borderColor: navBorder, color: ctaColor }}
                            className="px-6 py-2 rounded-full backdrop-blur-xl border text-[11px] font-inter font-medium tracking-[0.08em] hover:opacity-80 transition-opacity duration-300"
                        >
                            Acessar
                        </motion.div>
                    </Link>
                </motion.div>

            </div>
        </header>
    );
}

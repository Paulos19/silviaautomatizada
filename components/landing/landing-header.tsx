"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navLinks = [
    { label: "Sobre", href: "#about" },
    { label: "Médicos", href: "#doctors" },
    { label: "Simulação", href: "#simulation" },
    { label: "Depoimentos", href: "#testimonials" },
    { label: "Contato", href: "#contact" },
];

export function LandingHeader() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 pointer-events-none">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

                {/* Island 1: Logo */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="pointer-events-auto"
                >
                    <Link href="/" className="relative flex items-center group bg-white/5 backdrop-blur-2xl border border-white/5 p-1.5 rounded-2xl hover:bg-white/10 transition-all duration-500 ease-out">
                        <div className="relative w-20 h-7 overflow-hidden">
                            <img
                                src="/logo.png"
                                alt="Silvia Logo"
                                className="w-full h-full object-contain relative z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                            />
                        </div>
                    </Link>
                </motion.div>

                {/* Island 2: Navigation Links */}
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-2xl border border-white/5 p-1 rounded-full pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-500"
                        >
                            {link.label}
                        </Link>
                    ))}
                </motion.nav>

                {/* Island 3: Actions */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 pointer-events-auto bg-white/5 backdrop-blur-2xl border border-white/5 p-1 rounded-full"
                >
                    <Link
                        href="/login"
                        className="px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white transition-all duration-500"
                    >
                        Acessar
                    </Link>

                    <Link
                        href="/register"
                        className="px-6 py-1.5 rounded-full bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 hover:scale-105 transition-all duration-500 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                    >
                        Assinar
                    </Link>
                </motion.div>

            </div>
        </header>
    );
}

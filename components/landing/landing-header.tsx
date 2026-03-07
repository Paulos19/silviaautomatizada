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
                    <Link href="/" className="relative flex items-center group bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl hover:bg-white/10 transition-all duration-300">
                        <div className="relative w-24 h-8">
                            <img
                                src="/logo.png"
                                alt="Silvia Logo"
                                className="w-full h-full object-contain relative z-10"
                            />
                        </div>
                    </Link>
                </motion.div>

                {/* Island 2: Navigation Links */}
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-full pointer-events-auto"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
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
                    className="flex items-center gap-3 pointer-events-auto bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-full"
                >
                    <Link
                        href="/login"
                        className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors"
                    >
                        Acessar
                    </Link>

                    <Link
                        href="/register"
                        className="px-6 py-2 rounded-full bg-teal-500 text-[#042F2E] text-xs font-black uppercase tracking-widest hover:bg-teal-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                    >
                        Assinar
                    </Link>
                </motion.div>

            </div>
        </header>
    );
}

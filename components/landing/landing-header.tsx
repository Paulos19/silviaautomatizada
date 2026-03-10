"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const navLinks = [
    { label: "Funções", href: "#features" },
    { label: "Produto", href: "#about" },
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
                            <img
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
                    className="hidden md:flex items-center gap-1 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] px-2 py-1.5 rounded-full pointer-events-auto"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="px-5 py-1.5 rounded-full text-[11px] font-inter font-medium tracking-[0.08em] text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-500"
                        >
                            {link.label}
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
                    <Link
                        href="/login"
                        className="px-6 py-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] text-[11px] font-inter font-medium tracking-[0.08em] text-white/70 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.12] transition-all duration-500"
                    >
                        Acessar
                    </Link>
                </motion.div>

            </div>
        </header>
    );
}

"use client";

import Link from "next/link";
import { Instagram, Linkedin, Github } from "lucide-react";

const footerLinks = [
    {
        title: "Plataforma",
        links: [
            { label: "Agentes IA", href: "#features" },
            { label: "Agenda", href: "#features" },
            { label: "Analytics", href: "#features" },
            { label: "Segurança", href: "#" },
        ],
    },
    {
        title: "Recursos",
        links: [
            { label: "Documentação", href: "#" },
            { label: "Integrações", href: "#" },
            { label: "API", href: "#" },
            { label: "Status", href: "#" },
        ],
    },
    {
        title: "Empresa",
        links: [
            { label: "Sobre", href: "#about" },
            { label: "Contato", href: "#contact" },
            { label: "Privacidade", href: "#" },
            { label: "Termos", href: "#" },
        ],
    },
];

const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
];

export function SuperFooter() {
    return (
        <footer className="w-full bg-black border-t border-white/[0.04] pt-20 pb-10 px-6 md:px-12 select-none">
            <div className="max-w-[1100px] mx-auto">

                {/* Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 md:gap-8 mb-16">

                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative w-24 h-8 overflow-hidden">
                                <img
                                    src="/logo.png"
                                    alt="Silvia"
                                    className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                />
                            </div>
                        </Link>

                        <p className="text-sm font-inter font-light text-white/25 max-w-xs leading-relaxed">
                            Inteligência artificial generativa para gestão clínica.
                            Agendamento, prontuários e analytics — tudo orquestrado.
                        </p>

                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <Link
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="p-2.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-500"
                                    >
                                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {footerLinks.map((section) => (
                        <div key={section.title} className="space-y-5">
                            <h4 className="text-[11px] font-inter font-medium uppercase tracking-[0.15em] text-white/30">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-inter text-white/20 hover:text-white/50 transition-colors duration-500"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] font-inter text-white/15">
                        © {new Date().getFullYear()} Silvia AI. Todos os direitos reservados.
                    </p>
                    <p className="text-[11px] font-inter text-white/10">
                        Built by Paulo Henrique.
                    </p>
                </div>

            </div>
        </footer>
    );
}

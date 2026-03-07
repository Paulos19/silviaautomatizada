"use client";

import Link from "next/link";
import { Github, Instagram, Linkedin, Twitter, MessageSquare, Zap, Shield, Cpu } from "lucide-react";

const footerLinks = [
    {
        title: "Plataforma",
        links: [
            { label: "Tecnologia AI", href: "#hero" },
            { label: "Corpo Clínico", href: "#doctors" },
            { label: "Simulação", href: "#simulation" },
            { label: "Segurança", href: "#security" },
        ],
    },
    {
        title: "Recursos",
        links: [
            { label: "Casos de Estudo", href: "#" },
            { label: "Biblioteca", href: "#" },
            { label: "Documentação", href: "#" },
            { label: "Blog", href: "#" },
        ],
    },
    {
        title: "Institucional",
        links: [
            { label: "A Silvia", href: "#" },
            { label: "Carreiras", href: "#" },
            { label: "Contato", href: "/contact" },
            { label: "Legal", href: "#" },
        ],
    },
];

export function SuperFooter() {
    return (
        <footer className="w-full bg-[#09090B] border-t border-white/5 pt-24 pb-12 px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">

                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 group-hover:border-teal-500/40 transition-colors">
                                <Zap className="w-6 h-6 text-teal-400" />
                            </div>
                            <span className="text-2xl font-outfit font-bold tracking-tight text-white">Silvia</span>
                        </Link>

                        <p className="text-lg text-slate-400 max-w-sm font-inter leading-relaxed">
                            Orquestrando o futuro da gestão clínica com inteligência artificial generativa e automação de alto nível.
                        </p>

                        <div className="flex items-center gap-4">
                            <Link href="#" className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <Github className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerLinks.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <h4 className="text-sm font-outfit font-semibold uppercase tracking-widest text-teal-500">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-400 hover:text-white transition-colors font-inter text-base"
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
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            <Cpu className="w-3 h-3 text-teal-500" />
                            Next.js 15
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            <Shield className="w-3 h-3 text-teal-500" />
                            Secure Auth
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            <MessageSquare className="w-3 h-3 text-teal-500" />
                            N8N Pipeline
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 font-inter">
                        © {new Date().getFullYear()} Silvia AI. Todos os direitos reservados.
                        <span className="ml-2 text-slate-600">Built by Paulo Henrique.</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

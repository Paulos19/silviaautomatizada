"use client";

import Link from "next/link";
import { Instagram, Linkedin, ArrowUpRight } from "lucide-react";

const footerLinks = [
  {
    title: "Plataforma",
    links: [
      { label: "Atendimento IA", href: "#features" },
      { label: "Gestão de Agenda", href: "#features" },
      { label: "Visão Computacional", href: "#n8n-features" },
      { label: "Segurança & Silos", href: "#core" },
    ],
  },
  {
    title: "Hospital",
    links: [
      { label: "Hospital Otorrinos Curitiba", href: "#" },
      { label: "Corpo Clínico", href: "/login" },
      { label: "Integração Clinic", href: "#" },
      { label: "Portal Administrativo", href: "/login" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Privacidade & LGPD", href: "#" },
      { label: "Termos de Uso", href: "#" },
      { label: "Suporte 24/7", href: "#contact" },
      { label: "Agendar Demonstração", href: "#contact" },
    ],
  },
];

export function SuperFooter() {
  return (
    <footer className="relative w-full bg-gradient-to-b from-transparent to-white/95 border-t border-slate-200/60 pt-28 pb-12 px-6 md:px-12 select-none z-10">
      <div className="max-w-6xl mx-auto">
        {/* Linha Superior: Logo, Descrição e Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 md:gap-8 mb-16">
          {/* Marca Silvia */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <img
                src="/silvia-logo.svg"
                alt="Silvia Logo"
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-sm text-slate-600 font-sans leading-relaxed max-w-sm">
              Inteligência médica humanizada e orquestração autônoma de ponta para clínicas e consultórios médicos.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>SISTEMA ATIVO NO HOSPITAL OTORRINOS</span>
            </div>
          </div>

          {/* Colunas de Navegação */}
          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                {column.title}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-slate-950 transition-colors font-sans flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Linha Inferior: Copyright e Redes */}
        <div className="pt-8 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© {new Date().getFullYear()} Silvia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

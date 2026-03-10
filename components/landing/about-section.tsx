"use client";

import { useEffect, useRef, useState } from "react";

export function AboutSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="w-full min-h-screen bg-black text-white overflow-hidden flex flex-col justify-center select-none"
        >
            <div className="w-full max-w-[1100px] mx-auto px-6 md:px-12 flex flex-col gap-16 py-32 md:py-48">

                {/* Micro Label */}
                <div
                    className="transition-all duration-1000"
                    style={{
                        opacity: isVisible ? 0.4 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(12px)",
                    }}
                >
                    <p className="text-[11px] font-inter font-medium uppercase tracking-[0.2em] text-teal-400">
                        Plataforma Médica Inteligente
                    </p>
                </div>

                {/* Main Headline */}
                <h2
                    className="font-outfit font-extralight text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] tracking-[-0.03em] text-white transition-all duration-[1200ms]"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(40px)",
                        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                >
                    Inteligência<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                        que cuida.
                    </span>
                </h2>

                {/* Sub-paragraph */}
                <p
                    className="max-w-2xl text-lg md:text-xl font-inter font-light leading-relaxed text-white/40 transition-all duration-1000 delay-300"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(30px)",
                        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                >
                    A Silvia orquestra agendamentos, prontuários e atendimento com IA generativa —
                    para que sua clínica opere com a precisão e elegância que seus pacientes merecem.
                </p>

                {/* Decorative Line */}
                <div
                    className="w-px h-20 bg-gradient-to-b from-teal-500/40 to-transparent transition-all duration-1000 delay-500"
                    style={{ opacity: isVisible ? 1 : 0 }}
                />

            </div>
        </section>
    );
}

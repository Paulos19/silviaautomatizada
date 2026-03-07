"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function AboutSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const titleText = "SílviaAI";
    const dirs = [
        "translate3d(0, -200px, 0)",
        "translate3d(0, 200px, 0)",
        "translate3d(-200px, 100px, 0)",
        "translate3d(200px, 0, 0)",
        "translate3d(-100px, -200px, 0)",
        "translate3d(200px, 200px, 0)",
        "translate3d(0, -300px, 0)",
        "translate3d(-200px, 0, 0)"
    ];

    return (
        <section
            ref={sectionRef}
            className="w-full min-h-screen bg-black text-[#F5F5F0] overflow-hidden flex flex-col justify-center select-none pt-24 pb-32"
        >
            <div className="w-full max-w-[1700px] mx-auto px-6 md:px-12 flex flex-col gap-16 md:gap-32">

                {/* Huge Convergent Top Title */}
                <h2 className="font-outfit font-bold tracking-tighter w-full flex justify-between overflow-visible">
                    {titleText.split("").map((char, i) => (
                        <span
                            key={i}
                            className="inline-block text-[20vw] md:text-[22vw] leading-[0.75] transition-all duration-[1500ms]"
                            style={{
                                transform: isVisible ? "translate3d(0,0,0) scale(1) rotate(0deg)" : `${dirs[i % dirs.length]} scale(0.6) rotate(${i % 2 === 0 ? '15deg' : '-15deg'})`,
                                opacity: isVisible ? 1 : 0,
                                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                                transitionDelay: `${i * 80}ms`
                            }}
                        >
                            {char}
                        </span>
                    ))}
                </h2>

                {/* Info Bar a la Reference */}
                <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm md:text-base font-inter font-light tracking-wide text-[#F5F5F0]/50 transition-all duration-1000 delay-500"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(20px)"
                    }}
                >
                    <div>Plataforma Médica SP</div>
                    <div className="md:text-center text-[#F5F5F0]">Conceito ↓</div>
                    <div className="md:text-right">Sincronia Global → 24:00 7D</div>
                </div>

                {/* Sub Hero Text (Description) */}
                <div
                    className="w-full flex justify-start md:justify-end mt-4 transition-all duration-1000 delay-700"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(40px)"
                    }}
                >
                    <p className="max-w-3xl text-3xl md:text-5xl lg:text-6xl font-inter leading-[1.1] tracking-tight text-[#F5F5F0]">
                        Convergindo estratégia, precisão clínica e vanguarda tecnológica para arquitetar soluções que elevam a performance de médicos e instituições.
                    </p>
                </div>

            </div>
        </section>
    );
}

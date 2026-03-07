"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";

export function CreatorSection({ className }: { className?: string }) {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Scroll progress for the entire section to drive typography parallax
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Typography Parallax Transforms (Constant slow movement based on scroll)
    const line1Y = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const line2Y = useTransform(scrollYProgress, [0, 1], [100, -100]);

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

    const images = [
        "https://bzbrxkmhdxvh0b4p.public.blob.vercel-storage.com/silviaimages/Gemini_Generated_Image_h1x5bah1x5bah1x5.png",
        "https://bzbrxkmhdxvh0b4p.public.blob.vercel-storage.com/silviaimages/Gemini_Generated_Image_h1x5bah1x5bah1x5.png",
        "https://bzbrxkmhdxvh0b4p.public.blob.vercel-storage.com/silviaimages/beautiful-young-woman-relaxing-bed.jpg",
        "https://bzbrxkmhdxvh0b4p.public.blob.vercel-storage.com/silviaimages/close-up-portrait-gorgeous-blond-woman-with-perfect-skin-blue-eyes-posing-beach.jpg"
    ];

    return (
        <section
            ref={sectionRef}
            className={cn("w-full bg-[#EFEFEF] text-[#1D1D1B] pt-32 pb-32 flex flex-col items-center select-none overflow-hidden", className)}
        >
            <div className="w-full max-w-[1700px] px-6 md:px-12 flex flex-col items-start">

                {/* Header Superior da Secção (estilo menu flutuante) */}
                <div
                    className="w-full flex justify-between items-start font-inter text-[10px] md:text-xs uppercase tracking-widest font-semibold text-[#1D1D1B] opacity-0 translate-y-4 transition-all duration-[1200ms]"
                    style={{ opacity: isVisible ? 0.7 : 0, transform: isVisible ? "translateY(0)" : "translateY(20px)", transitionDelay: "100ms" }}
                >
                    <div>Sílvia Medical&reg;</div>
                    <div className="flex gap-4 md:gap-8 opacity-70">
                        <span className="hidden md:inline">Fundação</span>
                        <span>Arquitetura</span>
                        <span>Visão</span>
                    </div>
                </div>

                {/* Título Principal Brutalista/Swiss Design c/ Parallax Vertical Contínuo */}
                <div className="w-full mt-16 md:mt-32 relative flex flex-col items-start">
                    <h2 className="font-outfit font-medium text-[12vw] md:text-[10vw] leading-[0.85] tracking-tighter uppercase text-[#1D1D1B] flex flex-col max-w-[70%]">

                        {/* Linha 1 movendo verticalmente */}
                        <motion.div
                            style={{ y: line1Y }}
                            className="flex flex-wrap gap-x-[0.25em]"
                        >
                            {"UMA PLATAFORMA DE INTELIGÊNCIA".split(" ").map((word, i) => (
                                <span
                                    key={`l1-${i}`}
                                    className="inline-block opacity-0 transition-opacity duration-[1500ms]"
                                    style={{
                                        opacity: isVisible ? 1 : 0,
                                        transitionDelay: `${150 + (i * 100)}ms`
                                    }}
                                >
                                    {word}
                                </span>
                            ))}
                        </motion.div>

                        {/* Linha 2 movendo verticalmente a uma velocidade diferente */}
                        <motion.div
                            style={{ y: line2Y }}
                            className="flex flex-wrap gap-x-[0.25em] mt-4"
                        >
                            {"ORQUESTRADA POR ANA PAULA RIBEIRO".split(" ").map((word, i) => (
                                <span
                                    key={`l2-${i}`}
                                    className="inline-block opacity-0 transition-opacity duration-[1500ms]"
                                    style={{
                                        opacity: isVisible ? 1 : 0,
                                        transitionDelay: `${550 + (i * 100)}ms`
                                    }}
                                >
                                    {word}
                                </span>
                            ))}
                        </motion.div>
                    </h2>

                    <div
                        className="mt-20 font-inter text-[10px] md:text-xs uppercase tracking-widest max-w-[200px] leading-tight opacity-0 transition-opacity duration-[1200ms]"
                        style={{ opacity: isVisible ? 0.6 : 0, transitionDelay: "900ms" }}
                    >
                        Desenvolvido para<br />Engajar Hospitais<br />Construído para Cuidar
                    </div>
                </div>

                {/* Grid 4 Imagens estilo "AndAgain/Studio" otimizadas (Vercel Blobs) */}
                <div className="w-full mt-24 md:mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] md:gap-[4px] bg-[#D4D4D4] border-y-[2px] border-[#D4D4D4]">
                    {images.map((imgUrl, index) => (
                        <div
                            key={index}
                            className="relative aspect-[3/4] md:aspect-[4/5] bg-[#D4D4D4] group overflow-hidden opacity-0 translate-y-8 transition-all duration-1000"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateY(0)" : "translateY(40px)",
                                transitionDelay: `${800 + (index * 150)}ms`
                            }}
                        >
                            <img
                                src={imgUrl}
                                alt={`Ana Paula Ribeiro Model ${index + 1}`}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
                            />
                            {/* Numeração Lateral no card */}
                            <div className="absolute top-4 right-4 text-[10px] font-inter font-bold text-[#1D1D1B] bg-white/70 backdrop-blur-sm px-1.5 py-0.5 rounded-sm mix-blend-screen drop-shadow-sm">
                                {String(index + 1).padStart(2, '0')}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

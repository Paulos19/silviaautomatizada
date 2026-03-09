"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function CreatorSection({ className }: { className?: string }) {
    const images = [
        "https://bzbrxkmhdxvh0b4p.public.blob.vercel-storage.com/silviaimages/Gemini_Generated_Image_h1x5bah1x5bah1x5.png",
        "https://bzbrxkmhdxvh0b4p.public.blob.vercel-storage.com/silviaimages/Gemini_Generated_Image_h1x5bah1x5bah1x5.png",
        "https://bzbrxkmhdxvh0b4p.public.blob.vercel-storage.com/silviaimages/beautiful-young-woman-relaxing-bed.jpg",
        "https://bzbrxkmhdxvh0b4p.public.blob.vercel-storage.com/silviaimages/close-up-portrait-gorgeous-blond-woman-with-perfect-skin-blue-eyes-posing-beach.jpg"
    ];

    return (
        <section
            className={cn("w-full bg-[#EFEFEF] text-[#1D1D1B] pt-32 pb-32 flex flex-col items-center select-none overflow-hidden", className)}
        >
            <div className="w-full max-w-[1700px] px-6 md:px-12 flex flex-col items-start">

                {/* Header Superior da Secção (estilo menu flutuante) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 0.7, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="w-full flex justify-between items-start font-inter text-[10px] md:text-xs uppercase tracking-widest font-semibold text-[#1D1D1B]"
                >
                    <div>Sílvia Medical&reg;</div>
                    <div className="flex gap-4 md:gap-8 opacity-70">
                        <span className="hidden md:inline">Fundação</span>
                        <span>Arquitetura</span>
                        <span>Visão</span>
                    </div>
                </motion.div>

                {/* Título Principal Brutalista/Swiss Design */}
                <div className="w-full mt-16 md:mt-32 relative flex flex-col items-start">
                    <h2 className="font-outfit font-medium text-[12vw] md:text-[10vw] leading-[0.85] tracking-tighter uppercase text-[#1D1D1B] flex flex-col max-w-[70%]">
                        <motion.span
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="block will-change-transform"
                        >
                            UMA PLATAFORMA DE INTELIGÊNCIA
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="block mt-4 will-change-transform"
                        >
                            ORQUESTRADA POR ANA PAULA RIBEIRO
                        </motion.span>
                    </h2>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.6 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.6 }}
                        className="mt-20 font-inter text-[10px] md:text-xs uppercase tracking-widest max-w-[200px] leading-tight"
                    >
                        Desenvolvido para<br />Engajar Hospitais<br />Construído para Cuidar
                    </motion.div>
                </div>

                {/* Grid 4 Imagens estilo "AndAgain/Studio" otimizadas */}
                <div className="w-full mt-24 md:mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] md:gap-[4px] bg-[#D4D4D4] border-y-[2px] border-[#D4D4D4]">
                    {images.map((imgUrl, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="relative aspect-[3/4] md:aspect-[4/5] bg-[#D4D4D4] group overflow-hidden will-change-transform"
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
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}

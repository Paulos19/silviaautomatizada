"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
    {
        tempId: 0,
        testimonial: "A Silvia revolucionou o fluxo da nossa clínica. Agendamentos duplicados agora são coisa do passado.",
        by: "Dr. Ricardo, Diretor Clínico",
        imgSrc: "https://i.pravatar.cc/150?u=doc1"
    },
    {
        tempId: 1,
        testimonial: "Meus pacientes adoram a facilidade de marcar pelo WhatsApp. A taxa de absenteísmo caiu 40%.",
        by: "Dra. Letícia, Otorrinolaringologista",
        imgSrc: "https://i.pravatar.cc/150?u=doc2"
    },
    {
        tempId: 2,
        testimonial: "A integração com o n8n e a IA é impecável. Parece que temos uma secretária 24/7 de alto nível.",
        by: "Felipe, Gestor de TI Hospitalar",
        imgSrc: "https://i.pravatar.cc/150?u=doc3"
    },
    {
        tempId: 3,
        testimonial: "Software robusto, rápido e extremamente intuitivo. O treinamento da equipe levou minutos.",
        by: "Mariana, Administradora de Hospital",
        imgSrc: "https://i.pravatar.cc/150?u=doc4"
    },
    {
        tempId: 4,
        testimonial: "O melhor investimento em tecnologia que fizemos este ano. O ROI foi imediato.",
        by: "Sr. Antônio, Proprietário de Centro Médico",
        imgSrc: "https://i.pravatar.cc/150?u=doc5"
    }
];

interface TestimonialCardProps {
    position: number;
    testimonial: typeof testimonials[0];
    handleMove: (steps: number) => void;
    cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
    position,
    testimonial,
    handleMove,
    cardSize
}) => {
    const isCenter = position === 0;

    return (
        <div
            onClick={() => handleMove(position)}
            className={cn(
                "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
                isCenter
                    ? "z-10 bg-teal-600 text-white border-teal-500 shadow-[0_20px_50px_rgba(20,184,166,0.3)]"
                    : "z-0 bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-teal-500/50"
            )}
            style={{
                width: cardSize,
                height: cardSize,
                clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
                transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
            }}
        >
            <span
                className="absolute block origin-top-right rotate-45 bg-white/10"
                style={{
                    right: -2,
                    top: 48,
                    width: SQRT_5000,
                    height: 2
                }}
            />
            <img
                src={testimonial.imgSrc}
                alt={`${testimonial.by.split(',')[0]}`}
                className="mb-4 h-14 w-12 bg-zinc-800 object-cover object-top rounded-sm grayscale group-hover:grayscale-0 transition-all"
                style={{
                    boxShadow: isCenter ? "3px 3px 0px rgba(0,0,0,0.2)" : "3px 3px 0px rgba(255,255,255,0.05)"
                }}
            />
            <h3 className={cn(
                "text-base sm:text-xl font-medium font-outfit leading-tight",
                isCenter ? "text-white" : "text-zinc-200"
            )}>
                "{testimonial.testimonial}"
            </h3>
            <p className={cn(
                "absolute bottom-8 left-8 right-8 mt-2 text-sm italic font-inter",
                isCenter ? "text-teal-100" : "text-zinc-500"
            )}>
                - {testimonial.by}
            </p>
        </div>
    );
};

export const StaggerTestimonials: React.FC = () => {
    const [cardSize, setCardSize] = useState(365);
    const [testimonialsList, setTestimonialsList] = useState(testimonials);

    const handleMove = (steps: number) => {
        const newList = [...testimonialsList];
        if (steps > 0) {
            for (let i = steps; i > 0; i--) {
                const item = newList.shift();
                if (!item) return;
                newList.push({ ...item, tempId: Math.random() });
            }
        } else {
            for (let i = steps; i < 0; i++) {
                const item = newList.pop();
                if (!item) return;
                newList.unshift({ ...item, tempId: Math.random() });
            }
        }
        setTestimonialsList(newList);
    };

    useEffect(() => {
        const updateSize = () => {
            const { matches } = window.matchMedia("(min-width: 640px)");
            setCardSize(matches ? 365 : 290);
        };

        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return (
        <div
            className="relative w-full overflow-hidden bg-black py-20"
            style={{ height: 750 }}
        >
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center z-20 space-y-2">
                <h2 className="text-3xl md:text-5xl font-outfit font-bold text-white tracking-tight">
                    Voz de quem <span className="text-teal-500">Confia</span>
                </h2>
                <p className="text-zinc-500 font-inter text-sm md:text-base">
                    Líderes do setor de saúde que já orquestram suas clínicas com a Sílvia.
                </p>
            </div>

            {testimonialsList.map((testimonial, index) => {
                const position = index - Math.floor(testimonialsList.length / 2);
                return (
                    <TestimonialCard
                        key={testimonial.tempId}
                        testimonial={testimonial}
                        handleMove={handleMove}
                        position={position}
                        cardSize={cardSize}
                    />
                );
            })}

            <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-4 z-20">
                <button
                    onClick={() => handleMove(-1)}
                    className={cn(
                        "flex h-12 w-12 items-center justify-center text-xl transition-all rounded-full",
                        "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-teal-600 hover:text-white hover:border-teal-500",
                        "focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    )}
                    aria-label="Previous testimonial"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => handleMove(1)}
                    className={cn(
                        "flex h-12 w-12 items-center justify-center text-xl transition-all rounded-full",
                        "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-teal-600 hover:text-white hover:border-teal-500",
                        "focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    )}
                    aria-label="Next testimonial"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

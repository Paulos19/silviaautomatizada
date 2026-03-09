"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

interface FlipCardProps {
    src: string;
    index: number;
    delay: number;
    target: { x: number; y: number; rotation: number; scale: number };
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;
const TOTAL_IMAGES = 20;

function FlipCard({ src, index, delay, target }: FlipCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 }}
            whileInView={{
                opacity: 1,
                scale: target.scale,
                x: target.x,
                y: target.y,
                rotate: target.rotation,
            }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 1.5,
                delay: delay,
                type: "spring",
                stiffness: 40,
                damping: 20,
            }}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-default group will-change-transform"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ rotateY: 180 }}
            >
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-[#1A1A1A] border border-white/10"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={src}
                        alt={`sílvia-ecosystem-${index}`}
                        loading="lazy"
                        className="h-full w-full object-cover filter grayscale opacity-70 transition-all group-hover:grayscale-0 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 transition-colors group-hover:opacity-0" />
                </div>

                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center p-4 border border-primary/30"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="text-center">
                        <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-1">Ver</p>
                        <p className="text-xs font-medium text-white">Análise</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

const IMAGES = [
    "https://images.unsplash.com/photo-1576091160550-2173ff9e5eb4?w=300&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&q=80",
    "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=300&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300&q=80",
    "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=300&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&q=80",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&q=80",
    "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=300&q=80",
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&q=80",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=80",
    "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=300&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&q=80",
    "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=300&q=80",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&q=80",
];

export function ScrollMorphHero() {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);

        setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    const arcTargets = useMemo(() => {
        if (!containerSize.width) return [];

        const isMobile = containerSize.width < 768;
        const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
        const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
        const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
        const arcCenterY = arcApexY + arcRadius;

        const spreadAngle = isMobile ? 100 : 130;
        const startAngle = -90 - (spreadAngle / 2);
        const step = spreadAngle / (TOTAL_IMAGES - 1);

        return IMAGES.map((_, i) => {
            const currentArcAngle = startAngle + (i * step);
            const arcRad = (currentArcAngle * Math.PI) / 180;

            return {
                x: Math.cos(arcRad) * arcRadius,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.4 : 1.8,
            };
        });
    }, [containerSize]);

    return (
        <section className="relative w-full overflow-hidden bg-black select-none">
            <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden py-32">
                <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">

                    {/* Arc Active Content (Fades in) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1 }}
                        className="relative z-10 flex flex-col items-center justify-center text-center px-6 mb-24 md:mb-32 pointer-events-none"
                    >
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-outfit font-semibold text-[#F5F5F0] tracking-tight mb-4 drop-shadow-lg">
                            Visão do Ecossistema
                        </h2>
                        <p className="text-sm md:text-base lg:text-lg font-inter text-slate-400 max-w-2xl leading-relaxed">
                            Descubra como a Sílvia unifica estratégia, criatividade e tecnologia. <br className="hidden md:block" />
                            Role pelas inteligências desenhadas para moldar as clínicas do futuro.
                        </p>
                    </motion.div>

                    {/* Main Container - Rotating slowly to replace the scroll binding */}
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [-2, 2, -2] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="relative flex items-center justify-center w-full h-[60vh]"
                    >
                        {arcTargets.length > 0 && IMAGES.map((src, i) => (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                delay={i * 0.05} // Staggered entrance
                                target={arcTargets[i]}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

"use client";

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black">
            <div className="w-12 h-12 border-t-2 border-r-2 border-teal-500 rounded-full animate-spin"></div>
            <p className="text-teal-500 text-xs font-inter mt-4 tracking-widest uppercase">Carregando IA 3D</p>
        </div>
    )
});

function HeroSplineBackground() {
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
            }
        }, { rootMargin: "600px" }); // Load 600px before reaching the section

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            pointerEvents: 'auto',
            overflow: 'hidden',
        }}>
            {isInView && (
                <Spline
                    style={{
                        width: '100%',
                        height: '100vh',
                        pointerEvents: 'auto',
                    }}
                    scene="https://prod.spline.design/dJqTIQ-tE3ULUPMi/scene.splinecode"
                />
            )}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    background: `
            linear-gradient(to right, rgba(0, 0, 0, 0.8), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.8)),
            linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.9))
          `,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

function ScreenshotSection({ screenshotRef }: { screenshotRef: React.RefObject<HTMLDivElement | null> }) {
    return (
        <section className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 mt-11 md:mt-12">
            <div ref={screenshotRef} className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 w-full md:w-[80%] lg:w-[70%] mx-auto transition-transform duration-75 ease-out">
                <div>
                    <img
                        src="/banner.png"
                        alt="Silvia Dashboard Preview"
                        className="w-full h-auto block rounded-lg mx-auto"
                    />
                </div>
            </div>
        </section>
    );
}

function HeroContent() {
    return (
        <div className="text-white px-4 max-w-screen-xl mx-auto w-full flex flex-col lg:flex-row justify-between items-start lg:items-center py-16">

            <div className="w-full lg:w-1/2 pr-0 lg:pr-8 mb-8 lg:mb-0">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-wide font-outfit">
                    Orquestrando o<br />Futuro da Saúde
                </h1>
                <div className="text-sm text-teal-400 font-semibold opacity-90 mt-4 tracking-[0.2em]">
                    IA \ AUTOMAÇÃO \ GESTÃO \ 3D \ FLUIDEZ
                </div>
            </div>

            <div className="w-full lg:w-1/2 pl-0 lg:pl-8 flex flex-col items-start">
                <p className="text-base sm:text-lg opacity-80 mb-6 max-w-md font-inter">
                    A Silvia não apenas agenda, ela entende, organiza e potencializa cada interação clínica com inteligência de última geração.
                </p>
                <div className="flex pointer-events-auto flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                    <button className="border border-teal-500/50 text-white font-semibold py-2.5 sm:py-3.5 px-6 sm:px-8 rounded-2xl transition duration-300 w-full sm:w-auto hover:bg-teal-500 hover:text-black">
                        Saiba Mais
                    </button>
                    <button className="pointer-events-auto bg-teal-500 text-black font-semibold py-2.5 sm:py-3.5 px-6 sm:px-8 rounded-2xl transition duration-300 hover:scale-105 flex items-center justify-center w-full sm:w-auto shadow-[0_0_20px_rgba(20,184,166,0.4)]">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" fill="currentColor" />
                        </svg>
                        Falar com Silvia
                    </button>
                </div>
            </div>

        </div>
    );
}

const Hero3DSection = () => {
    const screenshotRef = useRef<HTMLDivElement>(null);
    const heroContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (screenshotRef.current && heroContentRef.current) {
                requestAnimationFrame(() => {
                    const scrollPosition = window.pageYOffset;

                    // Calculando o offset da seção para iniciar o parallax apenas quando visível
                    const rect = screenshotRef.current?.parentElement?.getBoundingClientRect();
                    if (rect && rect.top < window.innerHeight) {
                        const relativeScroll = Math.max(0, window.innerHeight - rect.top);
                        if (screenshotRef.current) {
                            screenshotRef.current.style.transform = `translateY(-${relativeScroll * 0.2}px)`;
                        }
                    }

                    // Esmaecimento do conteúdo com base no scroll relativo (opcional)
                    const opacity = 1 - Math.min(scrollPosition / 600, 1);
                    // heroContentRef.current.style.opacity = opacity.toString();
                });
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="relative overflow-hidden bg-black">
            <div className="relative min-h-screen">
                <div className="absolute inset-0 z-0 pointer-events-auto">
                    <HeroSplineBackground />
                </div>

                <div ref={heroContentRef} className="absolute top-0 left-0 w-full h-screen flex justify-center items-center z-10 pointer-events-none">
                    <HeroContent />
                </div>
            </div>

            <div className="bg-black relative z-10" style={{ marginTop: '-15vh' }}>
                <ScreenshotSection screenshotRef={screenshotRef} />
                <div className="container mx-auto px-4 py-24 text-white text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 font-outfit">Uma Experiência Imersiva</h2>
                    <p className="max-w-2xl mx-auto opacity-70 font-inter text-lg">
                        Desenhada para simplicidade, construída para potência. A Silvia integra-se perfeitamente ao fluxo de trabalho da sua equipe, eliminando gargalos e elevando o padrão de atendimento.
                    </p>
                </div>
            </div>
        </div>
    );
};

export { Hero3DSection };

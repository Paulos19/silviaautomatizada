"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroScrollSequenceProps {
    className?: string;
}

export function HeroScrollSequence({ className }: HeroScrollSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imagesLoaded, setImagesLoaded] = useState(0);

    const frameCount = 144;
    const imagesRef = useRef<HTMLImageElement[]>([]);

    // Format the number to exactly 3 digits e.g. "001" up to "240"
    const currentFrame = (index: number) =>
        `/section1/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`;

    // Pre-load all frames on mount
    useEffect(() => {
        let isMounted = true;
        const preloadImages = async () => {
            const arr: HTMLImageElement[] = new Array(frameCount);
            let loadedCount = 0;

            const loadImage = (i: number) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = currentFrame(i);
                    img.onload = () => {
                        if (isMounted) {
                            loadedCount++;
                            setImagesLoaded(loadedCount);
                            // Draw first frame as soon as it's ready
                            if (i === 1) requestAnimationFrame(() => updateImage(0));
                        }
                        resolve(img);
                    };
                    img.onerror = () => {
                        console.error(`Failed to load image: ${img.src}`);
                        resolve(null);
                    };
                    arr[i - 1] = img;
                });
            };

            // Load all images in parallel
            const promises = [];
            for (let i = 1; i <= frameCount; i++) {
                promises.push(loadImage(i));
            }

            await Promise.all(promises);

            if (isMounted) {
                imagesRef.current = arr;
            }
        };

        preloadImages();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Set Canvas Dimensions and draw
    const updateImage = (index: number) => {
        if (!canvasRef.current || imagesRef.current.length === 0) return;

        const safeIndex = Math.min(Math.max(index, 0), frameCount - 1);
        const img = imagesRef.current[safeIndex];
        if (!img) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const baseWidth = window.innerWidth;
        const baseHeight = window.innerHeight;

        // Update canvas size considering DPR for high-quality rendering
        if (canvas.width !== baseWidth * dpr || canvas.height !== baseHeight * dpr) {
            canvas.width = baseWidth * dpr;
            canvas.height = baseHeight * dpr;
            ctx.scale(dpr, dpr);
        }

        // Calculate aspect ratio to fit the screen without upscaling (object-contain behavior + max scale 1)
        const hRatio = baseWidth / img.width;
        const vRatio = baseHeight / img.height;
        // Scale down if image is larger than screen, otherwise keep original size (ratio = 1)
        const ratio = Math.min(1, hRatio, vRatio);

        // If desktop, align towards the right side to balance the text on the left
        // If mobile, center it
        const isDesktop = baseWidth >= 768;

        const centerShift_x = isDesktop
            ? baseWidth - (img.width * ratio) - (baseWidth * 0.1) // 10% padding from right
            : (baseWidth - img.width * ratio) / 2;

        const centerShift_y = (baseHeight - img.height * ratio) / 2;

        ctx.clearRect(0, 0, baseWidth, baseHeight);
        ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            centerShift_x,
            centerShift_y,
            img.width * ratio,
            img.height * ratio
        );
    };

    // Element Refs for Storytelling Texts
    const text1Ref = useRef<HTMLDivElement>(null);
    const text2Ref = useRef<HTMLDivElement>(null);
    const text3Ref = useRef<HTMLDivElement>(null);
    const text4Ref = useRef<HTMLDivElement>(null);

    // Timeline calculation helper
    const calcTransform = (progress: number, start: number, end: number) => {
        if (progress < start) return { opacity: 0, translateY: 30 };
        if (progress > end) return { opacity: 0, translateY: -30 };

        const range = end - start;
        const localProgress = (progress - start) / range;

        let opacity = 1;
        if (localProgress < 0.2) opacity = localProgress / 0.2; // fade in 20%
        else if (localProgress > 0.8) opacity = 1 - ((localProgress - 0.8) / 0.2); // fade out 20%

        const translateY = 30 - (localProgress * 60); // Parallax up
        return { opacity, translateY };
    };

    const calcFinalTransform = (progress: number, start: number) => {
        if (progress < start) return { opacity: 0, translateY: 30 };

        const localProgress = Math.min((progress - start) / (1 - start), 1);
        let opacity = 1;
        if (localProgress < 0.3) opacity = localProgress / 0.3;

        const translateY = 30 - (localProgress * 30); // Stop at 0
        return { opacity, translateY };
    };

    // Scroll Event Listener
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (!containerRef.current) return;

                    const { top, height } = containerRef.current.getBoundingClientRect();
                    const windowHeight = window.innerHeight;

                    const scrollTop = -top;
                    const maxScrollTop = height - windowHeight;
                    const scrollFraction = Math.max(0, Math.min(scrollTop / maxScrollTop, 1));

                    // Update Canvas
                    const frameIndex = Math.floor(scrollFraction * (frameCount - 1));
                    updateImage(frameIndex);

                    // Update Texts
                    if (text1Ref.current) {
                        const { opacity, translateY } = calcTransform(scrollFraction, 0.02, 0.25);
                        text1Ref.current.style.opacity = opacity.toString();
                        text1Ref.current.style.transform = `translateY(${translateY}px)`;
                    }
                    if (text2Ref.current) {
                        const { opacity, translateY } = calcTransform(scrollFraction, 0.28, 0.52);
                        text2Ref.current.style.opacity = opacity.toString();
                        text2Ref.current.style.transform = `translateY(${translateY}px)`;
                    }
                    if (text3Ref.current) {
                        const { opacity, translateY } = calcTransform(scrollFraction, 0.55, 0.80);
                        text3Ref.current.style.opacity = opacity.toString();
                        text3Ref.current.style.transform = `translateY(${translateY}px)`;
                    }
                    if (text4Ref.current) {
                        const { opacity, translateY } = calcFinalTransform(scrollFraction, 0.82);
                        text4Ref.current.style.opacity = opacity.toString();
                        text4Ref.current.style.transform = `translateY(${translateY}px)`;
                    }

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        // Initial setup
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    const TitleBaseClass = "text-4xl md:text-6xl lg:text-7xl font-outfit font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-tr from-slate-400 via-white to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] mix-blend-screen";
    const SubtitleBaseClass = "text-lg md:text-2xl text-slate-300 font-inter font-light max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mix-blend-normal leading-relaxed";

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full bg-black", className)}
            style={{ height: "400vh" }}
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {imagesLoaded < frameCount && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-6" />
                            <p className="font-outfit text-white font-medium text-lg tracking-widest uppercase">Inicializando Motor IA</p>
                            <p className="font-inter text-slate-500 text-sm mt-2">{Math.round((imagesLoaded / frameCount) * 100)}% processado</p>
                        </div>
                    </div>
                )}

                {/* Overlay de gradiente mais agressivo na esquerda para dar legibilidade ao texto */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />

                <canvas
                    ref={canvasRef}
                    className="block w-full h-full object-cover relative z-0"
                />

                {/* Storytelling Elements Container */}
                <div className="absolute inset-0 flex flex-col justify-center items-start z-20 pointer-events-none p-8 md:px-[10%] pt-20">

                    {/* Text 1 */}
                    <div ref={text1Ref} className="absolute opacity-0 flex flex-col items-start translate-y-[30px] will-change-transform">
                        <h2 className={TitleBaseClass}>
                            A Evolução do<br />Atendimento
                        </h2>
                        <p className={SubtitleBaseClass}>
                            Mais do que uma assistente virtual. Uma revolução clínica contínua orquestrando sua infraestrutura.
                        </p>
                    </div>

                    {/* Text 2 */}
                    <div ref={text2Ref} className="absolute opacity-0 flex flex-col items-start translate-y-[30px] will-change-transform">
                        <h2 className={TitleBaseClass}>
                            Voz Humanizada e<br />Imediata
                        </h2>
                        <p className={SubtitleBaseClass}>
                            Interações por voz incrivelmente fluidas. Compreensão de contexto emocional em tempo real, 24/7.
                        </p>
                    </div>

                    {/* Text 3 */}
                    <div ref={text3Ref} className="absolute opacity-0 flex flex-col items-start translate-y-[30px] will-change-transform">
                        <h2 className={TitleBaseClass}>
                            Gestão Inteligente<br />Preditiva
                        </h2>
                        <p className={SubtitleBaseClass}>
                            Triagem automatizada, agendamentos otimizados e suporte ininterrupto acoplados nativamente ao seu ecossistema.
                        </p>
                    </div>

                    {/* Text 4 (Final) */}
                    <div ref={text4Ref} className="absolute opacity-0 flex flex-col items-start translate-y-[30px] will-change-transform">
                        <div className="flex items-center gap-4 mb-2 opacity-80">
                            <div className="w-8 h-[1px] bg-teal-500"></div>
                            <span className="text-teal-400 font-inter uppercase tracking-[0.3em] text-xs">AURA OS</span>
                        </div>
                        <h2 className={TitleBaseClass}>
                            Conheça Silvia.
                        </h2>
                        <p className={SubtitleBaseClass}>
                            O ápice da Inteligência Artificial agora dedicado inteiramente à excelência da medicina.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

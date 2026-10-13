"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { Sparkles, RotateCcw } from "lucide-react";

interface ThreePhoneFrameProps {
    children: React.ReactNode;
    className?: string;
}

export function ThreePhoneFrame({ children, className }: ThreePhoneFrameProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const phoneMeshRef = useRef<THREE.Group | null>(null);
    const lightRef = useRef<THREE.PointLight | null>(null);

    const [is3DActive, setIs3DActive] = useState(true);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const canvas = canvasRef.current;
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 780;

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
        camera.position.set(0, 0, 11);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        rendererRef.current = renderer;

        // 2. Iluminação de estúdio para reflexos no chassi
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x0d9488, 3.5, 30); // Teal rim light
        pointLight1.position.set(6, 6, 8);
        scene.add(pointLight1);
        lightRef.current = pointLight1;

        const pointLight2 = new THREE.PointLight(0x38bdf8, 2.5, 30); // Sky blue fill light
        pointLight2.position.set(-6, -4, 6);
        scene.add(pointLight2);

        const topSpecular = new THREE.DirectionalLight(0xffffff, 1.8);
        topSpecular.position.set(0, 10, 5);
        scene.add(topSpecular);

        // 3. Chassi 3D do Smartphone (Titanium Bezel)
        const phoneGroup = new THREE.Group();
        phoneMeshRef.current = phoneGroup;

        // Corpo metálico externo (Chassi)
        const phoneWidth = 4.8;
        const phoneHeight = 9.8;
        const phoneDepth = 0.45;
        const cornerRadius = 0.55;

        // Formato com cantos arredondados usando Shape
        const shape = new THREE.Shape();
        const x = -phoneWidth / 2;
        const y = -phoneHeight / 2;
        const w = phoneWidth;
        const h = phoneHeight;
        const r = cornerRadius;

        shape.moveTo(x + r, y);
        shape.lineTo(x + w - r, y);
        shape.quadraticCurveTo(x + w, y, x + w, y + r);
        shape.lineTo(x + w, y + h - r);
        shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        shape.lineTo(x + r, y + h);
        shape.quadraticCurveTo(x, y + h, x, y + h - r);
        shape.lineTo(x, y + r);
        shape.quadraticCurveTo(x, y, x + r, y);

        const extrudeSettings = {
            depth: phoneDepth,
            bevelEnabled: true,
            bevelSegments: 5,
            steps: 2,
            bevelSize: 0.08,
            bevelThickness: 0.08
        };

        const chassisGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        chassisGeo.center();

        // Material Titânio Escuro Escovado com brilho metálico
        const titaniumMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#0f172a"),
            metalness: 0.92,
            roughness: 0.22,
            envMapIntensity: 1.5
        });

        const chassisMesh = new THREE.Mesh(chassisGeo, titaniumMat);
        phoneGroup.add(chassisMesh);

        // Borda de vidro chanfrada traseira
        const edgeGlowGeo = new THREE.RingGeometry(2.4, 2.5, 32);
        const edgeGlowMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#0d9488"),
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        });
        const edgeGlow = new THREE.Mesh(edgeGlowGeo, edgeGlowMat);
        edgeGlow.position.z = -0.3;
        phoneGroup.add(edgeGlow);

        scene.add(phoneGroup);

        // 4. Animação contínua e render loop
        let animationFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Respiração sutil de iluminação
            if (pointLight1) {
                pointLight1.intensity = 3.5 + Math.sin(elapsedTime * 1.5) * 0.5;
            }

            renderer.render(scene, camera);
        };
        animate();

        // 5. Redimensionamento
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
            const newW = containerRef.current.clientWidth;
            const newH = containerRef.current.clientHeight;
            cameraRef.current.aspect = newW / newH;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newW, newH);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            chassisGeo.dispose();
            titaniumMat.dispose();
        };
    }, []);

    // 6. Efeito de inclinação 3D interativa no mouse com GSAP
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!is3DActive || !containerRef.current || !phoneMeshRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        // Inclinação suave do chassi Three.js
        gsap.to(phoneMeshRef.current.rotation, {
            y: mouseX * 0.28, // rotação no eixo Y (até ~16 graus)
            x: -mouseY * 0.25, // rotação no eixo X (até ~14 graus)
            duration: 0.65,
            ease: "power2.out"
        });

        // Deslocamento da luz para realçar o chanfro
        if (lightRef.current) {
            gsap.to(lightRef.current.position, {
                x: mouseX * 12 + 6,
                y: -mouseY * 12 + 6,
                duration: 0.65,
                ease: "power2.out"
            });
        }

        // Inclinação da tela HTML em perspectiva CSS para coincidir perfeitamente com o chassi
        const screenEl = containerRef.current.querySelector(".phone-screen-container");
        if (screenEl) {
            gsap.to(screenEl, {
                rotateY: mouseX * 14,
                rotateX: -mouseY * 12,
                duration: 0.65,
                ease: "power2.out",
                transformPerspective: 1000
            });
        }
    };

    const handleMouseLeave = () => {
        if (!phoneMeshRef.current || !containerRef.current) return;

        gsap.to(phoneMeshRef.current.rotation, {
            x: 0,
            y: 0,
            duration: 1.0,
            ease: "elastic.out(1, 0.4)"
        });

        const screenEl = containerRef.current.querySelector(".phone-screen-container");
        if (screenEl) {
            gsap.to(screenEl, {
                rotateY: 0,
                rotateX: 0,
                duration: 1.0,
                ease: "elastic.out(1, 0.4)"
            });
        }
    };

    const reset3DView = () => {
        if (!phoneMeshRef.current || !containerRef.current) return;
        gsap.to(phoneMeshRef.current.rotation, { x: 0, y: 0, duration: 0.8, ease: "power2.out" });
        const screenEl = containerRef.current.querySelector(".phone-screen-container");
        if (screenEl) {
            gsap.to(screenEl, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power2.out" });
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative w-full max-w-[420px] h-[820px] mx-auto flex items-center justify-center select-none perspective-[1200px]",
                className
            )}
        >
            {/* Canvas Three.js de fundo (Chassi 3D e Iluminação Especular) */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />

            {/* Aura de iluminação neon atrás do aparelho */}
            <div className="absolute inset-10 bg-teal-500/15 blur-3xl rounded-full pointer-events-none -z-10 animate-pulse" />

            {/* Borda de Titanio realista e Tela do Smartphone */}
            <div
                className="phone-screen-container relative w-[370px] h-[760px] rounded-[48px] p-[10px] bg-gradient-to-b from-slate-700 via-slate-900 to-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(13,148,136,0.25)] border-[3px] border-slate-600/60 z-10 overflow-hidden transform-gpu transition-shadow duration-500"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Reflexo de vidro na borda da tela */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-30 rounded-[44px]" />

                {/* Speaker e Câmera Frontal (Punch-hole notch) */}
                <div className="absolute top-3 inset-x-0 flex justify-center items-center z-40 pointer-events-none">
                    <div className="flex items-center gap-2 bg-black/90 px-3.5 py-1 rounded-full border border-white/10 shadow-inner">
                        {/* Câmera frontal */}
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                        </div>
                        {/* Alto-falante de chamada */}
                        <div className="w-9 h-1 rounded-full bg-slate-800" />
                    </div>
                </div>

                {/* Área da Tela Interna (WhatsApp Interface) */}
                <div className="relative w-full h-full bg-[#111B21] rounded-[38px] overflow-hidden flex flex-col z-20">
                    {children}
                </div>
            </div>

            {/* Botão sutil para resetar visão 3D */}
            <button
                onClick={reset3DView}
                title="Resetar inclinação 3D"
                className="absolute -bottom-3 right-4 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] text-slate-400 hover:text-teal-400 hover:border-teal-500/40 backdrop-blur-md transition-all flex items-center gap-1 z-30"
            >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset 3D</span>
            </button>
        </div>
    );
}

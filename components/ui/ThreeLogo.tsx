"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";

interface ThreeLogoProps {
    className?: string;
    showText?: boolean;
}

/**
 * ThreeLogo
 * Emblema interativo 3D gerado com Three.js e SVG vetorial.
 * Apresenta uma geometria procedural em ouro polido e esmeralda sobre fundo âmbar luminoso,
 * respondendo com suavidade ao cursor, combinada à tipografia elegante do Hospital Otorrinos Curitiba e Silv.IA.
 */
export function ThreeLogo({ className, showText = true }: ThreeLogoProps) {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = 42;
        const height = 42;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 3.6;

        let renderer: THREE.WebGLRenderer | null = null;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            mount.appendChild(renderer.domElement);
        } catch {
            return;
        }

        // Iluminação dourada quente e estúdio claro
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xffd700, 3.5, 10);
        pointLight1.position.set(2, 3, 3);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x10b981, 2.0, 10);
        pointLight2.position.set(-2, -2, 2);
        scene.add(pointLight2);

        // Geometria orgânica em ouro polido brilhante
        const geometry = new THREE.TorusKnotGeometry(0.85, 0.28, 64, 16, 2, 3);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xf59e0b,
            emissive: 0xd97706,
            emissiveIntensity: 0.25,
            roughness: 0.15,
            metalness: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let animationFrameId: number;
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (event: MouseEvent) => {
            const rect = mount.getBoundingClientRect();
            const x = event.clientX - (rect.left + rect.width / 2);
            const y = event.clientY - (rect.top + rect.height / 2);
            mouseX = (x / (window.innerWidth / 2)) * 0.8;
            mouseY = (y / (window.innerHeight / 2)) * 0.8;
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            mesh.rotation.x += 0.012;
            mesh.rotation.y += 0.016;

            targetX += (mouseX - targetX) * 0.05;
            targetY += (mouseY - targetY) * 0.05;
            mesh.position.x = targetX * 0.3;
            mesh.position.y = -targetY * 0.3;

            if (renderer) {
                renderer.render(scene, camera);
            }
        };

        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            if (renderer && renderer.domElement && mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
                renderer.dispose();
            }
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return (
        <Link
            href="/dashboard/orchestrator"
            className={`flex items-center gap-2.5 sm:gap-3 group select-none shrink-0 ${className || ""}`}
        >
            {/* Moldura Luminosa Dourada com Three.js */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-100 p-0.5 flex items-center justify-center shadow-[0_4px_16px_rgba(245,190,56,0.25)] border border-amber-300/80 group-hover:scale-105 transition-transform duration-300">
                <div ref={mountRef} className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] flex items-center justify-center overflow-hidden rounded-[14px]">
                    <svg className="w-5 h-5 text-amber-900 -z-10 absolute pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v10M8 12h8" />
                    </svg>
                </div>
            </div>

            {/* Tipografia Vetorial & Nome da Instituição */}
            {showText && (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 leading-none">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm tracking-tight">
                            Hospital Otorrinos
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/70 leading-none">
                            Curitiba
                        </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                        <span className="text-amber-800 font-semibold">Silv.IA</span>
                        <span>• Inteligência Clínica</span>
                    </span>
                </div>
            )}
        </Link>
    );
}

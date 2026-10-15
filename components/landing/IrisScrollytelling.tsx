"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Share2, Volume2, Sparkles } from "lucide-react";

interface IrisScrollytellingProps {
  className?: string;
}

export function IrisScrollytelling({ className = "" }: IrisScrollytellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);

  // Scroll tracking across the 400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth physics spring for organic scroll inertia (Premium Motion archetype)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  // Track chapters for UI typography
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      if (latest < 0.28) {
        setActiveChapter(0);
      } else if (latest < 0.55) {
        setActiveChapter(1);
      } else if (latest < 0.8) {
        setActiveChapter(2);
      } else {
        setActiveChapter(3);
      }
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Three.js 3D Procedural Fiber & Iris Morphing Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff4e6, 2.8);
    mainLight.position.set(3, 6, 8);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const warmUnderlight = new THREE.PointLight(0xffa500, 3.5, 12);
    warmUnderlight.position.set(0, -3.5, 3);
    scene.add(warmUnderlight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(-5, 4, -2);
    scene.add(rimLight);

    // 3. Background Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.set(0, 0, -0.6);
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 4. Center Concentric Aperture Rings (Emerge when morphing into Iris)
    const ringGroup = new THREE.Group();
    const innerRingGeo = new THREE.RingGeometry(0.55, 0.58, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x222224,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, ringMat);
    ringGroup.add(innerRing);

    // Subtle outer halo ring
    const outerRingGeo = new THREE.RingGeometry(1.65, 1.665, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x999999,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    ringGroup.add(outerRing);
    scene.add(ringGroup);

    // 5. Perimeter Radial Precision Pins (Visible in Iris Stage)
    const pinCount = 36;
    const pinPositions: number[] = [];
    const pinColors: number[] = [];
    for (let p = 0; p < pinCount; p++) {
      const angle = (p / pinCount) * Math.PI * 2;
      const r1 = 1.68;
      const r2 = 1.95;
      pinPositions.push(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
      pinPositions.push(Math.cos(angle) * r2, Math.sin(angle) * r2, 0);
      pinColors.push(0.8, 0.8, 0.8, 0.6, 0.6, 0.6);
    }
    const pinGeo = new THREE.BufferGeometry();
    pinGeo.setAttribute("position", new THREE.Float32BufferAttribute(pinPositions, 3));
    const pinMat = new THREE.LineBasicMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0,
      linewidth: 1,
    });
    const pinLines = new THREE.LineSegments(pinGeo, pinMat);
    scene.add(pinLines);

    // 6. 3D Procedural Fibers & Glowing Tips
    const NUM_FIBERS = 120;
    const POINTS_PER_FIBER = 32;

    // Create random seed offsets for organic strand variations
    const fiberParams = Array.from({ length: NUM_FIBERS }, (_, i) => {
      const baseAngle = (i / NUM_FIBERS) * Math.PI * 2;
      const angleJitter = (Math.random() - 0.5) * 0.08;
      const lengthMult = 0.88 + Math.random() * 0.24;
      const spiralSpeed = 3.2 + Math.random() * 0.8;
      const waveFreq = 1.5 + Math.random() * 2.0;
      const wavePhase = Math.random() * Math.PI * 2;
      return {
        angle: baseAngle + angleJitter,
        lengthMult,
        spiralSpeed,
        waveFreq,
        wavePhase,
      };
    });

    // Vertex positions & colors buffer for all fiber lines
    const totalVertices = NUM_FIBERS * POINTS_PER_FIBER;
    const fiberPositions = new Float32Array(totalVertices * 3);
    const fiberColors = new Float32Array(totalVertices * 3);

    // Gradient colors along strand: Dark Bronze -> Golden Amber -> Luminous Yellow
    const colorRoot = new THREE.Color("#26170E");
    const colorMid = new THREE.Color("#C47D2B");
    const colorPreTip = new THREE.Color("#F5A623");
    const colorTip = new THREE.Color("#FFF275");

    for (let f = 0; f < NUM_FIBERS; f++) {
      for (let s = 0; s < POINTS_PER_FIBER; s++) {
        const idx = (f * POINTS_PER_FIBER + s) * 3;
        const t = s / (POINTS_PER_FIBER - 1);

        let vertexColor: THREE.Color;
        if (t < 0.45) {
          vertexColor = colorRoot.clone().lerp(colorMid, t / 0.45);
        } else if (t < 0.85) {
          vertexColor = colorMid.clone().lerp(colorPreTip, (t - 0.45) / 0.4);
        } else {
          vertexColor = colorPreTip.clone().lerp(colorTip, (t - 0.85) / 0.15);
        }

        fiberColors[idx] = vertexColor.r;
        fiberColors[idx + 1] = vertexColor.g;
        fiberColors[idx + 2] = vertexColor.b;
      }
    }

    // Line segments index buffer
    const lineIndices: number[] = [];
    for (let f = 0; f < NUM_FIBERS; f++) {
      const offset = f * POINTS_PER_FIBER;
      for (let s = 0; s < POINTS_PER_FIBER - 1; s++) {
        lineIndices.push(offset + s, offset + s + 1);
      }
    }

    const fiberGeometry = new THREE.BufferGeometry();
    fiberGeometry.setAttribute("position", new THREE.BufferAttribute(fiberPositions, 3));
    fiberGeometry.setAttribute("color", new THREE.BufferAttribute(fiberColors, 3));
    fiberGeometry.setIndex(lineIndices);

    const fiberMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.NormalBlending,
    });
    const fiberMesh = new THREE.LineSegments(fiberGeometry, fiberMaterial);
    scene.add(fiberMesh);

    // 7. Glowing Spheres for the 120 Fiber Tips
    const tipSphereGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const tipSphereMat = new THREE.MeshBasicMaterial({
      color: 0xfff080,
    });
    const tipInstancedMesh = new THREE.InstancedMesh(tipSphereGeo, tipSphereMat, NUM_FIBERS);
    scene.add(tipInstancedMesh);

    // Dummy Object3D for updating instanced matrices
    const dummy = new THREE.Object3D();

    // Mouse movement parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.targetY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Handle Window Resize
    const handleResize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // 8. Dynamic Morphing & Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const p = smoothProgress.get(); // Current scroll progress [0.0 to 1.0]

      // Object Group Tilt & Rotation linked to scroll progress & mouse
      const morphStage = p;

      // Camera & Group Orientation (Framing transitions from vertical drop to frontal iris)
      const baseRotX = THREE.MathUtils.lerp(0.15, 0.0, morphStage);
      const baseRotY = THREE.MathUtils.lerp(-0.25, 0.0, morphStage);
      const baseRotZ = THREE.MathUtils.lerp(0.0, 0.0, morphStage);

      fiberMesh.rotation.x = baseRotX + mouse.y * 0.12;
      fiberMesh.rotation.y = baseRotY + mouse.x * 0.15 + time * 0.04;
      fiberMesh.rotation.z = baseRotZ;

      ringGroup.rotation.copy(fiberMesh.rotation);
      pinLines.rotation.copy(fiberMesh.rotation);
      tipInstancedMesh.rotation.copy(fiberMesh.rotation);

      // Adjust Position of scene to keep object centered
      const centerOffsetY = THREE.MathUtils.lerp(0.2, 0.0, morphStage);
      fiberMesh.position.y = centerOffsetY;
      ringGroup.position.y = centerOffsetY;
      pinLines.position.y = centerOffsetY;
      tipInstancedMesh.position.y = centerOffsetY;

      // Rings and Pin Lines Opacity
      const irisFade = THREE.MathUtils.smoothstep(morphStage, 0.55, 0.95);
      ringMat.opacity = irisFade * 0.85;
      outerRingMat.opacity = irisFade * 0.45;
      pinMat.opacity = irisFade * 0.75;

      // Calculate 3D Curve points for each fiber based on scroll morph progress
      const posAttr = fiberGeometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let f = 0; f < NUM_FIBERS; f++) {
        const param = fiberParams[f];
        const theta = param.angle;
        let lastX = 0, lastY = 0, lastZ = 0;

        for (let s = 0; s < POINTS_PER_FIBER; s++) {
          const t = s / (POINTS_PER_FIBER - 1);
          const vertexIdx = (f * POINTS_PER_FIBER + s) * 3;

          // ==============================================================
          // STATE 1: BUNDLED VERTICAL CABLE (p = 0.0)
          // ==============================================================
          const cableSpiral = theta + (1.0 - t) * param.spiralSpeed;
          const cableRadius = 0.12 + t * 0.16 + Math.sin(t * Math.PI) * 0.08;
          const cableY = 2.1 - t * 2.6;
          const cableX = Math.cos(cableSpiral) * cableRadius;
          const cableZ = Math.sin(cableSpiral) * cableRadius;

          // ==============================================================
          // STATE 2: SPLAYED DOWNWARD TENTACLES / FANNING (p = 0.4)
          // ==============================================================
          const splayRadius = 0.12 + Math.pow(t, 1.4) * 1.35 * param.lengthMult;
          const splayAngle = theta + Math.sin(t * param.waveFreq + param.wavePhase + time * 0.8) * 0.15;
          const splayY = 1.6 - t * 2.8;
          const splayX = Math.cos(splayAngle) * splayRadius;
          const splayZ = Math.sin(splayAngle) * splayRadius;

          // ==============================================================
          // STATE 3: RADIATING CIRCULAR IRIS / CORONA (p = 1.0)
          // ==============================================================
          const irisInnerR = 0.56;
          const irisOuterR = 1.52 * param.lengthMult;
          const irisRadius = irisInnerR + t * (irisOuterR - irisInnerR);
          // Delicate organic S-curve along the fiber
          const irisAngle = theta + Math.sin(t * Math.PI) * 0.22 + Math.cos(theta * 3.0) * 0.06;
          // Slight 3D dome curvature
          const irisDomeZ = Math.sin(t * Math.PI) * 0.22 * (1.0 - t * 0.4);
          const irisX = Math.cos(irisAngle) * irisRadius;
          const irisY = Math.sin(irisAngle) * irisRadius;
          const irisZ = irisDomeZ;

          // Smooth multi-stage interpolation across scroll progress
          let currentX = 0, currentY = 0, currentZ = 0;

          if (morphStage <= 0.45) {
            const factor = morphStage / 0.45;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(cableX, splayX, eased);
            currentY = THREE.MathUtils.lerp(cableY, splayY, eased);
            currentZ = THREE.MathUtils.lerp(cableZ, splayZ, eased);
          } else {
            const factor = (morphStage - 0.45) / 0.55;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(splayX, irisX, eased);
            currentY = THREE.MathUtils.lerp(splayY, irisY, eased);
            currentZ = THREE.MathUtils.lerp(splayZ, irisZ, eased);
          }

          // Subtle organic breathing animation
          const idleWave = Math.sin(time * 1.2 + f * 0.15 + t * 4.0) * 0.015 * (1.0 - morphStage * 0.5);
          currentX += idleWave;
          currentY += idleWave * 0.5;

          positions[vertexIdx] = currentX;
          positions[vertexIdx + 1] = currentY;
          positions[vertexIdx + 2] = currentZ;

          if (s === POINTS_PER_FIBER - 1) {
            lastX = currentX;
            lastY = currentY;
            lastZ = currentZ;
          }
        }

        // Update the Glowing Tip Sphere for this fiber
        dummy.position.set(lastX, lastY, lastZ);
        // Slightly scale tips larger when forming the Iris
        const tipScale = THREE.MathUtils.lerp(0.85, 1.25, morphStage);
        dummy.scale.set(tipScale, tipScale, tipScale);
        dummy.updateMatrix();
        tipInstancedMesh.setMatrixAt(f, dummy.matrix);
      }

      posAttr.needsUpdate = true;
      tipInstancedMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      fiberGeometry.dispose();
      fiberMaterial.dispose();
      tipSphereGeo.dispose();
      tipSphereMat.dispose();
      pinGeo.dispose();
      pinMat.dispose();
      innerRingGeo.dispose();
      outerRingGeo.dispose();
      ringMat.dispose();
      outerRingMat.dispose();
    };
  }, [smoothProgress]);

  // Storytelling Content Data across the 4 frames
  const chapters = [
    {
      code: "[ 001 / 004 ]",
      letter: "( A )",
      titleTop: "WHERE AI",
      titleMid: "MERGES",
      titleItalic: "with",
      titleBottom: "// YOUR VISION",
      description:
        "Conectando a inteligência clínica profunda da Silvia aos sentidos do cuidado hospitalar em tempo real.",
      label: "INÍCIO DO FLUXO",
    },
    {
      code: "[ 002 / 004 ]",
      letter: "( B )",
      titleTop: "START seeing",
      titleMid: "DIFFERENTLY",
      titleItalic: "",
      titleBottom: "",
      description:
        "Nossa IA não apenas executa — ela visualiza, diagnostica e aperfeiçoa. Do conceito ao design final, oferecemos a clareza necessária.",
      label: "ANÁLISE DE PROFUNDIDADE",
    },
    {
      code: "[ 003 / 004 ]",
      letter: "( C )",
      titleTop: "PRECISION",
      titleMid: "at clinical",
      titleItalic: "scale",
      titleBottom: "// OTORRINOS",
      description:
        "Orquestração médica que une WhatsApp, prontuário e agenda em uma experiência contínua e sem fricção.",
      label: "ORQUESTRAÇÃO COGNITIVA",
    },
    {
      code: "[ 004 / 004 ]",
      letter: "( D )",
      titleTop: "THE NEW",
      titleMid: "standard",
      titleItalic: "of",
      titleBottom: "// HEALTH OS",
      description:
        "Um ecossistema inteligente desenhado para médicos e pacientes que redefine o padrão hospitalar brasileiro.",
      label: "SISTEMA INTEGRADO",
    },
  ];

  const current = chapters[activeChapter];

  return (
    <section
      ref={containerRef}
      className={`relative h-[420vh] w-full bg-[#111215] text-[#1E2022] ${className}`}
    >
      {/* Sticky Cinematic Viewport Screen Container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-hidden select-none">
        
        {/* Floating Screen Device Card */}
        <div className="relative w-full max-w-[1200px] h-[84vh] max-h-[720px] rounded-[30px] sm:rounded-[36px] bg-[#E7E7EA] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-white/20 flex flex-col justify-between">
          
          {/* ============================================================ */}
          {/* TOP BAR UI: Brand & Navigation                              */}
          {/* ============================================================ */}
          <div className="relative z-20 flex items-start justify-between p-6 sm:p-8">
            {/* Top Left: Logo & Version */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs font-bold tracking-wider text-slate-800 uppercase">
                (SILVIA_AI)
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                [ v2.4b ]
              </span>
            </div>

            {/* Top Right: Editorial Navigation Links with Arrows */}
            <nav className="flex flex-col items-end space-y-1 font-mono text-xs">
              <Link
                href="#features"
                className="group flex items-center gap-1 text-slate-700 hover:text-black transition-colors"
              >
                <span>início</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="#n8n-features"
                className="group flex items-center gap-1 text-slate-700 hover:text-black transition-colors"
              >
                <span>recursos</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="#core"
                className="group flex items-center gap-1 text-slate-700 hover:text-black transition-colors"
              >
                <span>hospital</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="group flex items-center gap-1 text-slate-700 hover:text-black transition-colors"
              >
                <span>portal médico</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </nav>
          </div>

          {/* ============================================================ */}
          {/* CENTER 3D WEBGL CANVAS: Procedural Neural Fiber & Iris Morph */}
          {/* ============================================================ */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain pointer-events-auto cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* ============================================================ */}
          {/* EDITORIAL STORYTELLING TYPOGRAPHY OVERLAY                    */}
          {/* ============================================================ */}
          <div className="relative z-20 grid grid-cols-12 gap-4 px-6 sm:px-8 items-center pointer-events-none mb-auto mt-auto">
            
            {/* Left Story Column */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-5 flex flex-col justify-center space-y-4">
              <motion.div
                key={activeChapter}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-3"
              >
                {/* Headline with High-Contrast Typography Hierarchy */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-[1.08] font-sans">
                  {current.titleTop && <span className="block">{current.titleTop}</span>}
                  {current.titleMid && <span className="block">{current.titleMid}</span>}
                  {current.titleItalic && (
                    <span className="italic font-serif font-normal text-slate-800 mr-2">
                      {current.titleItalic}
                    </span>
                  )}
                  {current.titleBottom && (
                    <span className="font-mono text-xl sm:text-2xl font-bold text-slate-700 tracking-tight">
                      {current.titleBottom}
                    </span>
                  )}
                </h2>

                {/* Subtitle Paragraph */}
                <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-sm">
                  {current.description}
                </p>
              </motion.div>
            </div>

            {/* Right Side Step Markers */}
            <div className="hidden sm:flex col-span-6 lg:col-span-7 justify-between items-center pl-8 text-slate-700 font-mono text-xs">
              <div className="ml-auto flex items-center gap-12">
                <span className="text-sm font-semibold tracking-wider">
                  {current.letter}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {current.code}
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BOTTOM BAR: CTA Pill & Controls                              */}
          {/* ============================================================ */}
          <div className="relative z-20 flex items-center justify-between p-6 sm:p-8">
            {/* Bottom Left: Share / Control */}
            <div className="flex items-center gap-2 text-slate-500">
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-black/5 hover:text-black transition-colors pointer-events-auto cursor-pointer"
                title="Compartilhar experiência"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-black/5 hover:text-black transition-colors pointer-events-auto cursor-pointer"
                title="Efeitos sonoros"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Center: Pill CTA Button */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 pointer-events-auto">
              <Link
                href="/login"
                className="group flex items-center gap-2 px-6 py-2 rounded-full border border-slate-400 bg-white/70 hover:bg-white text-slate-900 font-mono text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
                <span>TRY OUR DEMO</span>
              </Link>
            </div>

            {/* Bottom Right: Scroll Indicator Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <span>Scroll para explorar</span>
              <div className="w-12 h-1 bg-slate-300 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-slate-800"
                  style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* AMBER UNDERGLOW LIGHT SPILL (Under bottom edge of card)       */}
          {/* ============================================================ */}
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-t from-amber-500/35 via-amber-400/20 to-transparent blur-[70px] pointer-events-none rounded-full" />
        </div>

      </div>
    </section>
  );
}

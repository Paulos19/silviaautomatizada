"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ChevronDown, Share2, Volume2, ShieldCheck, HeartHandshake, Zap, Calendar } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function IrisScrollytellingExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for Chapter Elements
  const ch1LeftRef = useRef<HTMLDivElement>(null);
  const ch1RightRef = useRef<HTMLDivElement>(null);
  const ch2LeftRef = useRef<HTMLDivElement>(null);
  const ch2RightRef = useRef<HTMLDivElement>(null);
  const ch3LeftRef = useRef<HTMLDivElement>(null);
  const ch3RightRef = useRef<HTMLDivElement>(null);
  const ch4LeftRef = useRef<HTMLDivElement>(null);
  const ch4RightRef = useRef<HTMLDivElement>(null);
  const ctaPillRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Ref shared between GSAP and Three.js
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const pinWrapper = pinWrapperRef.current;
    const container = containerRef.current;
    if (!canvas || !pinWrapper || !container) return;

    // ========================================================================
    // 1. THREE.JS 3D SCENE SETUP (Luminous Studio White Aesthetic)
    // ========================================================================
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Studio Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xfffdf8, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 3.4);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0f5ff, 1.5);
    fillLight.position.set(-6, 3, 4);
    scene.add(fillLight);

    // Warm ambient point light for the final bloom
    const warmBloomLight = new THREE.PointLight(0xff9900, 3.5, 16);
    warmBloomLight.position.set(0, -0.8, 3.5);
    scene.add(warmBloomLight);

    // Floating 3D Golden Bokeh Dust Particles (as in Reference)
    const PARTICLE_COUNT = 90;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 4.0;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 4.4 + 0.3;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 2.8 + 0.2;

      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.003;
      particleSpeeds[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffdf6d,
      size: 0.048,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Concentric Central Aperture Ring (Appears at Bloom)
    const ringGroup = new THREE.Group();
    const innerRingGeo = new THREE.RingGeometry(0.58, 0.62, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1e2022,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, ringMat);
    ringGroup.add(innerRing);

    const outerRingGeo = new THREE.RingGeometry(1.9, 1.92, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    ringGroup.add(outerRing);
    scene.add(ringGroup);

    // Radiating Precision Pins (Frame 5)
    const pinCount = 40;
    const pinPositions: number[] = [];
    for (let p = 0; p < pinCount; p++) {
      const angle = (p / pinCount) * Math.PI * 2;
      const r1 = 1.95;
      const r2 = 2.3;
      pinPositions.push(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
      pinPositions.push(Math.cos(angle) * r2, Math.sin(angle) * r2, 0);
    }
    const pinGeo = new THREE.BufferGeometry();
    pinGeo.setAttribute("position", new THREE.Float32BufferAttribute(pinPositions, 3));
    const pinMat = new THREE.LineBasicMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0,
    });
    const pinLines = new THREE.LineSegments(pinGeo, pinMat);
    scene.add(pinLines);

    // Thick Procedural Optical Fibers & Glowing Bulb Tips
    const NUM_STRANDS = 120;
    const POINTS_PER_STRAND = 36;

    const strandParams = Array.from({ length: NUM_STRANDS }, (_, i) => {
      const baseAngle = (i / NUM_STRANDS) * Math.PI * 2;
      const angleJitter = (Math.random() - 0.5) * 0.08;
      const radiusMult = 0.85 + Math.random() * 0.35;
      const twistSpeed = 3.8 + Math.random() * 0.8;
      const waveFreq = 1.5 + Math.random() * 1.5;
      const wavePhase = Math.random() * Math.PI * 2;
      return {
        angle: baseAngle + angleJitter,
        radiusMult,
        twistSpeed,
        waveFreq,
        wavePhase,
      };
    });

    const totalVertices = NUM_STRANDS * POINTS_PER_STRAND;
    const strandPositions = new Float32Array(totalVertices * 3);
    const strandColors = new Float32Array(totalVertices * 3);

    const colorRoot = new THREE.Color("#22150D");
    const colorMid = new THREE.Color("#C87F28");
    const colorPreTip = new THREE.Color("#F5A41C");
    const colorTip = new THREE.Color("#FFF8A6");

    for (let f = 0; f < NUM_STRANDS; f++) {
      for (let s = 0; s < POINTS_PER_STRAND; s++) {
        const idx = (f * POINTS_PER_STRAND + s) * 3;
        const t = s / (POINTS_PER_STRAND - 1);

        let vertexColor: THREE.Color;
        if (t < 0.42) {
          vertexColor = colorRoot.clone().lerp(colorMid, t / 0.42);
        } else if (t < 0.82) {
          vertexColor = colorMid.clone().lerp(colorPreTip, (t - 0.42) / 0.4);
        } else {
          vertexColor = colorPreTip.clone().lerp(colorTip, (t - 0.82) / 0.18);
        }

        strandColors[idx] = vertexColor.r;
        strandColors[idx + 1] = vertexColor.g;
        strandColors[idx + 2] = vertexColor.b;
      }
    }

    const lineIndices: number[] = [];
    for (let f = 0; f < NUM_STRANDS; f++) {
      const offset = f * POINTS_PER_STRAND;
      for (let s = 0; s < POINTS_PER_STRAND - 1; s++) {
        lineIndices.push(offset + s, offset + s + 1);
      }
    }

    const strandGeometry = new THREE.BufferGeometry();
    strandGeometry.setAttribute("position", new THREE.BufferAttribute(strandPositions, 3));
    strandGeometry.setAttribute("color", new THREE.BufferAttribute(strandColors, 3));
    strandGeometry.setIndex(lineIndices);

    const strandMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.98,
    });
    const strandMesh = new THREE.LineSegments(strandGeometry, strandMaterial);
    scene.add(strandMesh);

    // Glowing Bulbous Tip Spheres (Chunky glowing dots as in reference)
    const tipSphereGeo = new THREE.SphereGeometry(0.038, 12, 12);
    const tipSphereMat = new THREE.MeshBasicMaterial({ color: 0xfff070 });
    const tipInstancedMesh = new THREE.InstancedMesh(tipSphereGeo, tipSphereMat, NUM_STRANDS);
    scene.add(tipInstancedMesh);

    const dummy = new THREE.Object3D();

    // Mouse Parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // ========================================================================
    // 2. GSAP SCROLLTRIGGER PINNING & FLUID CHAPTER TIMELINE
    // ========================================================================
    let smoothP = 0;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=450%",
          pin: pinWrapper,
          scrub: 1.2,
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress;
          },
        },
      });

      // Chapter 1: Starts visible in Hero. At 0.18 it drifts away to the sides
      tl.to(
        ch1LeftRef.current,
        { x: -90, opacity: 0, ease: "power2.inOut", duration: 0.15 },
        0.14
      ).to(
        ch1RightRef.current,
        { x: 90, opacity: 0, ease: "power2.inOut", duration: 0.15 },
        0.14
      );

      // Chapter 2: Emerges from the cords outward to the flanks (0.22 -> 0.44)
      tl.fromTo(
        ch2LeftRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, ease: "power2.out", duration: 0.12 },
        0.22
      )
        .fromTo(
          ch2RightRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, ease: "power2.out", duration: 0.12 },
          0.22
        )
        .to(
          ch2LeftRef.current,
          { x: -90, opacity: 0, ease: "power2.inOut", duration: 0.14 },
          0.44
        )
        .to(
          ch2RightRef.current,
          { x: 90, opacity: 0, ease: "power2.inOut", duration: 0.14 },
          0.44
        );

      // Chapter 3: Emerges from the cords outward to the flanks (0.48 -> 0.70)
      tl.fromTo(
        ch3LeftRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, ease: "power2.out", duration: 0.12 },
        0.48
      )
        .fromTo(
          ch3RightRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, ease: "power2.out", duration: 0.12 },
          0.48
        )
        .to(
          ch3LeftRef.current,
          { x: -90, opacity: 0, ease: "power2.inOut", duration: 0.14 },
          0.70
        )
        .to(
          ch3RightRef.current,
          { x: 90, opacity: 0, ease: "power2.inOut", duration: 0.14 },
          0.70
        );

      // Chapter 4 (Clímax & Desabrochar Harmonioso): Emerges with the final bloom (0.76 -> 1.0)
      tl.fromTo(
        ch4LeftRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, ease: "power2.out", duration: 0.14 },
        0.76
      )
        .fromTo(
          ch4RightRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, ease: "power2.out", duration: 0.14 },
          0.76
        )
        .fromTo(
          ctaPillRef.current,
          { y: 35, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, ease: "back.out(1.4)", duration: 0.15 },
          0.82
        );
    });

    // ========================================================================
    // 3. THREE.JS RENDER LOOP (Coupled with GSAP Scroll)
    // ========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Double-smoothed scroll interpolation
      const targetP = scrollProgressRef.current;
      smoothP += (targetP - smoothP) * 0.08;
      const p = smoothP;

      // Mouse Lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Floating Bokeh Movement
      const posArray = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posArray[i * 3] += particleSpeeds[i * 3];
        posArray[i * 3 + 1] += particleSpeeds[i * 3 + 1] + Math.sin(time + i) * 0.001;
        posArray[i * 3 + 2] += particleSpeeds[i * 3 + 2];

        if (posArray[i * 3] > 2.5) posArray[i * 3] = -2.5;
        if (posArray[i * 3] < -2.5) posArray[i * 3] = 2.5;
        if (posArray[i * 3 + 1] > 3.0) posArray[i * 3 + 1] = -3.0;
        if (posArray[i * 3 + 1] < -3.0) posArray[i * 3 + 1] = 3.0;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleMat.opacity = THREE.MathUtils.lerp(0.85, 0.45, p);

      // Dynamic Rotation: Starts angled in Hero, aligns frontal for the Iris
      const rotX = THREE.MathUtils.lerp(0.24, 0.0, p);
      const rotY = THREE.MathUtils.lerp(-0.28, 0.0, p) + time * 0.02;
      const rotZ = THREE.MathUtils.lerp(-0.08, 0.0, p);

      strandMesh.rotation.set(rotX + mouse.y * 0.08, rotY + mouse.x * 0.1, rotZ);
      ringGroup.rotation.copy(strandMesh.rotation);
      pinLines.rotation.copy(strandMesh.rotation);
      tipInstancedMesh.rotation.copy(strandMesh.rotation);
      particleSystem.rotation.y = time * 0.015 + mouse.x * 0.05;

      // Position: Centered throughout, slight parallax
      const posX = mouse.x * 0.06;
      const posY = mouse.y * 0.05;

      strandMesh.position.set(posX, posY, 0);
      ringGroup.position.set(posX, posY, 0);
      pinLines.position.set(posX, posY, 0);
      tipInstancedMesh.position.set(posX, posY, 0);
      particleSystem.position.set(posX * 0.5, posY * 0.5, 0);

      // Bloom Climax Factor (Around p >= 0.78)
      const bloomFactor = THREE.MathUtils.smoothstep(p, 0.76, 0.98);
      ringMat.opacity = bloomFactor * 0.9;
      outerRingMat.opacity = bloomFactor * 0.5;
      pinMat.opacity = bloomFactor * 0.8;
      warmBloomLight.intensity = THREE.MathUtils.lerp(2.5, 6.0, bloomFactor);

      // Morphing 3D Curve points
      const posAttr = strandGeometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let f = 0; f < NUM_STRANDS; f++) {
        const param = strandParams[f];
        const theta = param.angle;
        let lastX = 0, lastY = 0, lastZ = 0;

        for (let s = 0; s < POINTS_PER_STRAND; s++) {
          const t = s / (POINTS_PER_STRAND - 1);
          const vertexIdx = (f * POINTS_PER_STRAND + s) * 3;

          // State 1: Volumetric Braided Rope descending from top
          const cableSpiral = theta + (1.0 - t) * param.twistSpeed;
          const cableRadius = 0.16 + t * 0.22 + Math.sin(t * Math.PI) * 0.1;
          const cableY = 2.4 - t * 2.8;
          const cableX = Math.cos(cableSpiral) * cableRadius;
          const cableZ = Math.sin(cableSpiral) * cableRadius;

          // State 2: Gracefully Untwisting & Fanning downward
          const splayRadius = 0.2 + Math.pow(t, 1.3) * 1.55 * param.radiusMult;
          const splayAngle = theta + Math.sin(t * param.waveFreq + param.wavePhase + time * 0.7) * 0.18;
          const splayY = 1.8 - t * 3.2;
          const splayX = Math.cos(splayAngle) * splayRadius;
          const splayZ = Math.sin(splayAngle) * splayRadius;

          // State 3: Radial 3D Torus Shaping
          const torusInner = 0.52;
          const torusOuter = 1.55 * param.radiusMult;
          const torusR = torusInner + t * (torusOuter - torusInner);
          const torusAngle = theta + Math.sin(t * Math.PI) * 0.25;
          const torusZ = Math.sin(t * Math.PI) * 0.32;
          const torusX = Math.cos(torusAngle) * torusR;
          const torusY = Math.sin(torusAngle) * torusR;

          // State 4: Harmonious Explosive Floral Bloom (Clímax)
          const bloomInner = 0.62;
          const bloomOuter = 2.15 * param.radiusMult;
          const bloomR = bloomInner + Math.pow(t, 0.85) * (bloomOuter - bloomInner);
          const petalWave = Math.sin(theta * 6.0 + t * 4.0) * 0.08;
          const bloomAngle = theta + petalWave;
          const bloomZ = Math.sin(t * Math.PI * 0.7) * 0.18;
          const bloomX = Math.cos(bloomAngle) * bloomR;
          const bloomY = Math.sin(bloomAngle) * bloomR;

          let currentX = 0, currentY = 0, currentZ = 0;

          if (p < 0.32) {
            const factor = p / 0.32;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(cableX, splayX, eased);
            currentY = THREE.MathUtils.lerp(cableY, splayY, eased);
            currentZ = THREE.MathUtils.lerp(cableZ, splayZ, eased);
          } else if (p < 0.72) {
            const factor = (p - 0.32) / 0.4;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(splayX, torusX, eased);
            currentY = THREE.MathUtils.lerp(splayY, torusY, eased);
            currentZ = THREE.MathUtils.lerp(splayZ, torusZ, eased);
          } else {
            const factor = (p - 0.72) / 0.28;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(torusX, bloomX, eased);
            currentY = THREE.MathUtils.lerp(torusY, bloomY, eased);
            currentZ = THREE.MathUtils.lerp(torusZ, bloomZ, eased);
          }

          const idleWave = Math.sin(time * 1.1 + f * 0.18 + t * 3.5) * 0.016 * (1.0 - p * 0.4);
          currentX += idleWave;
          currentY += idleWave * 0.5;

          positions[vertexIdx] = currentX;
          positions[vertexIdx + 1] = currentY;
          positions[vertexIdx + 2] = currentZ;

          if (s === POINTS_PER_STRAND - 1) {
            lastX = currentX;
            lastY = currentY;
            lastZ = currentZ;
          }
        }

        dummy.position.set(lastX, lastY, lastZ);
        const tipScale = THREE.MathUtils.lerp(1.0, 1.45, bloomFactor);
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
      ctx.revert();
      renderer.dispose();
      strandGeometry.dispose();
      strandMaterial.dispose();
      tipSphereGeo.dispose();
      tipSphereMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      pinGeo.dispose();
      pinMat.dispose();
      innerRingGeo.dispose();
      outerRingGeo.dispose();
      ringMat.dispose();
      outerRingMat.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-[#FCFBF8] select-none">
      {/* ================================================================== */}
      {/* PINNED VIEWPORT STAGE (Fixed in Center during GSAP ScrollTrigger)  */}
      {/* ================================================================== */}
      <div
        ref={pinWrapperRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #FAF8F5 50%, #F5F0E8 100%)",
        }}
      >
        {/* Soft Ambient Warm Glow under the Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] bg-amber-400/14 blur-[160px] rounded-full pointer-events-none" />

        {/* 3D WebGL Canvas Layer (Zero Cards, Zero Overlap) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
        />

        {/* ================================================================ */}
        {/* TOP BAR: Logo & Navigation                                       */}
        {/* ================================================================ */}
        <div className="relative z-20 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <img
                src="/silvia-logo.svg"
                alt="Silvia Logo"
                className="h-8 sm:h-9 w-auto"
              />
            </Link>
            <span className="font-mono text-[10px] text-slate-400 tracking-wider">
              [ HOSPITAL OTORRINOS ]
            </span>
          </div>

          <nav className="flex flex-col items-end space-y-1.5 font-mono text-xs">
            <Link
              href="/login"
              className="group flex items-center gap-1.5 font-semibold text-slate-900 hover:text-black transition-colors"
            >
              <span>acessar portal</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </nav>
        </div>

        {/* ================================================================ */}
        {/* FLANKING CHAPTER TEXTS (Left & Right, Leaving Center 100% Free)   */}
        {/* ================================================================ */}
        <div className="relative z-20 w-full my-auto pointer-events-none">
          
          {/* -------------------------------------------------------------- */}
          {/* CHAPTER 1 (Scroll 0% - 20%): Initial Hero State                */}
          {/* -------------------------------------------------------------- */}
          <div className="grid grid-cols-12 gap-8 items-center w-full">
            <div
              ref={ch1LeftRef}
              className="col-span-12 sm:col-span-6 lg:col-span-5 flex flex-col justify-center space-y-4"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] font-sans">
                <span className="block">ONDE A IA</span>
                <span className="block">SE UNE</span>
                <span className="italic font-serif font-normal text-slate-700 mr-2 text-2xl sm:text-3xl lg:text-4xl">
                  à sua
                </span>
                <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
                  // VISÃO CLÍNICA
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-sm">
                Conectando a inteligência médica profunda da Silvia aos sentidos do cuidado hospitalar em tempo real no Hospital Otorrinos.
              </p>
            </div>

            {/* Completely Clear Center: col-span-2 on large screens */}
            <div className="hidden lg:block lg:col-span-2" />

            <div
              ref={ch1RightRef}
              className="hidden sm:flex col-span-12 sm:col-span-6 lg:col-span-5 flex-col items-end text-right font-mono text-xs text-slate-600 space-y-2"
            >
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold tracking-wider text-slate-900">
                  ( A )
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  [ 001 / 004 ]
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono max-w-xs leading-normal">
                Triagem contínua • Acolhimento médico imediato
              </p>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* CHAPTER 2 (Scroll 22% - 45%): Untwisting & Multimodal          */}
          {/* -------------------------------------------------------------- */}
          <div className="absolute inset-x-0 top-0 grid grid-cols-12 gap-8 items-center w-full">
            <div
              ref={ch2LeftRef}
              style={{ opacity: 0 }}
              className="col-span-12 sm:col-span-6 lg:col-span-5 flex flex-col justify-center space-y-4"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] font-sans">
                <span className="block">COMECE A</span>
                <span className="block">ENXERGAR</span>
                <span className="italic font-serif font-normal text-slate-700 mr-2 text-2xl sm:text-3xl lg:text-4xl">
                  de forma
                </span>
                <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
                  // DIFERENTE
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-sm">
                A Silvia não apenas agenda. Ela escuta áudios no WhatsApp, lê fotos de convênios e pedidos médicos com visão computacional, antecipando o prontuário sem burocracia.
              </p>
            </div>

            <div className="hidden lg:block lg:col-span-2" />

            <div
              ref={ch2RightRef}
              style={{ opacity: 0 }}
              className="hidden sm:flex col-span-12 sm:col-span-6 lg:col-span-5 flex-col items-end text-right font-mono text-xs text-slate-600 space-y-2"
            >
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold tracking-wider text-slate-900">
                  ( B )
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  [ 002 / 004 ]
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono max-w-xs leading-normal">
                Compreensão de áudio nativa • Leitura OCR de documentos
              </p>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* CHAPTER 3 (Scroll 48% - 70%): Autonomous Sync & Precision      */}
          {/* -------------------------------------------------------------- */}
          <div className="absolute inset-x-0 top-0 grid grid-cols-12 gap-8 items-center w-full">
            <div
              ref={ch3LeftRef}
              style={{ opacity: 0 }}
              className="col-span-12 sm:col-span-6 lg:col-span-5 flex flex-col justify-center space-y-4"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] font-sans">
                <span className="block">PRECISÃO</span>
                <span className="block">em tempo</span>
                <span className="italic font-serif font-normal text-slate-700 mr-2 text-2xl sm:text-3xl lg:text-4xl">
                  real
                </span>
                <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
                  // HOSPITAL OTORRINOS
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-sm">
                Sincronização instantânea com a agenda do ERP Clinic. Zero conflitos de horários, retenção de pacientes e sigilo absoluto sob a LGPD e normas do CFM.
              </p>
            </div>

            <div className="hidden lg:block lg:col-span-2" />

            <div
              ref={ch3RightRef}
              style={{ opacity: 0 }}
              className="hidden sm:flex col-span-12 sm:col-span-6 lg:col-span-5 flex-col items-end text-right font-mono text-xs text-slate-600 space-y-2"
            >
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold tracking-wider text-slate-900">
                  ( C )
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  [ 003 / 004 ]
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono max-w-xs leading-normal">
                127+ Médicos Ativos • 15 Convênios Homologados
              </p>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* CHAPTER 4 (Scroll 74% - 100%): Harmonious Bloom & Climax       */}
          {/* -------------------------------------------------------------- */}
          <div className="absolute inset-x-0 top-0 grid grid-cols-12 gap-8 items-center w-full">
            <div
              ref={ch4LeftRef}
              style={{ opacity: 0 }}
              className="col-span-12 sm:col-span-6 lg:col-span-5 flex flex-col justify-center space-y-4"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] font-sans">
                <span className="block">O PADRÃO</span>
                <span className="block">definitivo</span>
                <span className="italic font-serif font-normal text-slate-700 mr-2 text-2xl sm:text-3xl lg:text-4xl">
                  em
                </span>
                <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
                  // HEALTH OS
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-sm">
                Uma experiência desenhada para médicos e pacientes que redefine a excelência hospitalar. O desabrochar da inteligência em cada detalhe.
              </p>
            </div>

            <div className="hidden lg:block lg:col-span-2" />

            <div
              ref={ch4RightRef}
              style={{ opacity: 0 }}
              className="hidden sm:flex col-span-12 sm:col-span-6 lg:col-span-5 flex-col items-end text-right font-mono text-xs text-slate-600 space-y-2"
            >
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold tracking-wider text-slate-900">
                  ( D )
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  [ 004 / 004 ]
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono max-w-xs leading-normal">
                Disponibilidade 24/7 • Segurança nível bancário
              </p>
            </div>
          </div>

        </div>

        {/* ================================================================ */}
        {/* BOTTOM BAR: CTA Pill & Interactive Cues (Leaving Center Free)     */}
        {/* ================================================================ */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-slate-300 bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-black transition-colors pointer-events-auto cursor-pointer shadow-xs"
              title="Compartilhar"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-slate-300 bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-black transition-colors pointer-events-auto cursor-pointer shadow-xs"
              title="Áudio imersivo"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Central Pill Button: Animates in during the Bloom Climax */}
          <div
            ref={ctaPillRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-auto"
          >
            <Link
              href="/login"
              className="group flex items-center gap-2 px-7 py-3 rounded-full border border-slate-400/80 bg-white/90 hover:bg-white text-slate-900 font-mono text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
              <span>AGENDAR DEMONSTRAÇÃO</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            <span className="hidden sm:inline">Role para explorar</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-slate-600" />
          </div>
        </div>

      </div>

      {/* ================================================================== */}
      {/* FINAL CLEAN REFINED FOOTER (Positioned without covering the Iris)  */}
      {/* ================================================================== */}
      <footer className="relative w-full bg-[#FCFBF8] border-t border-slate-200/70 pt-16 pb-12 px-8 sm:px-16 z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src="/silvia-logo.svg"
              alt="Silvia"
              className="h-7 w-auto"
            />
            <span>• Hospital Otorrinos Curitiba</span>
          </div>

          <div className="flex items-center gap-8">
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              portal médico ↗
            </Link>
            <a
              href="https://wa.me/5561986446934"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              whatsapp ↗
            </a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              privacidade & lgpd
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Silvia. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

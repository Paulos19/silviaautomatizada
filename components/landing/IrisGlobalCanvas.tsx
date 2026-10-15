"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useScroll, useSpring } from "framer-motion";

export function IrisGlobalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track global scroll across the entire landing page [0.0 at top -> 1.0 at footer]
  const { scrollYProgress } = useScroll();

  // Smooth spring physics for organic inertia during scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 18,
    restDelta: 0.0008,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene & Camera Setup
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

    // 2. High-Key Studio Lighting (Luminous White & Warm Amber Accents)
    const ambientLight = new THREE.AmbientLight(0xfffdfa, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5eb, 3.2);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf2f7ff, 1.4);
    fillLight.position.set(-6, 3, 4);
    scene.add(fillLight);

    // Warm golden ambient point light that intensifies towards the footer bloom
    const warmBloomLight = new THREE.PointLight(0xffaa22, 3.5, 16);
    warmBloomLight.position.set(0, -1.0, 3.5);
    scene.add(warmBloomLight);

    // 3. Floating 3D Golden Bokeh Dust Particles (as in the Reference Image)
    const PARTICLE_COUNT = 85;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 3.8 + 0.3;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 4.2 + 0.4;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 2.5 + 0.2;

      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.003;
      particleSpeeds[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffdf6d,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 4. Concentric Central Aperture Ring (Appears at the Bloom Stage)
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

    const outerRingGeo = new THREE.RingGeometry(1.85, 1.87, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    ringGroup.add(outerRing);
    scene.add(ringGroup);

    // 5. Perimeter Radiating Guide Pins (Frame 5 / Bloom Stage)
    const pinCount = 40;
    const pinPositions: number[] = [];
    for (let p = 0; p < pinCount; p++) {
      const angle = (p / pinCount) * Math.PI * 2;
      const r1 = 1.9;
      const r2 = 2.25;
      pinPositions.push(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
      pinPositions.push(Math.cos(angle) * r2, Math.sin(angle) * r2, 0);
    }
    const pinGeo = new THREE.BufferGeometry();
    pinGeo.setAttribute("position", new THREE.Float32BufferAttribute(pinPositions, 3));
    const pinMat = new THREE.LineBasicMaterial({
      color: 0x999999,
      transparent: true,
      opacity: 0,
    });
    const pinLines = new THREE.LineSegments(pinGeo, pinMat);
    scene.add(pinLines);

    // 6. Thick Procedural Fiber Strands & Glowing Bulb Tips
    // To match the reference, strands are chunky, grouped, and dense
    const NUM_STRANDS = 120;
    const POINTS_PER_STRAND = 36;

    const strandParams = Array.from({ length: NUM_STRANDS }, (_, i) => {
      const baseAngle = (i / NUM_STRANDS) * Math.PI * 2;
      const angleJitter = (Math.random() - 0.5) * 0.09;
      const radiusMult = 0.85 + Math.random() * 0.35;
      const twistSpeed = 3.8 + Math.random() * 0.9;
      const waveFreq = 1.6 + Math.random() * 1.5;
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

    // Color gradient along strand:
    // Root: Dark bronze/titanium sheath (#22150D)
    // Mid: Warm burnished honey (#C87F28)
    // Pre-tip: Bright cadmium gold (#F5A41C)
    // Tip bulb: Incandescent luminous yellow (#FFF59D)
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
      blending: THREE.NormalBlending,
    });
    const strandMesh = new THREE.LineSegments(strandGeometry, strandMaterial);
    scene.add(strandMesh);

    // 7. Luminous Glowing Bulb Tip Spheres (Chunky glowing dots as in reference)
    const tipSphereGeo = new THREE.SphereGeometry(0.038, 12, 12);
    const tipSphereMat = new THREE.MeshBasicMaterial({
      color: 0xfff070,
    });
    const tipInstancedMesh = new THREE.InstancedMesh(tipSphereGeo, tipSphereMat, NUM_STRANDS);
    scene.add(tipInstancedMesh);

    const dummy = new THREE.Object3D();

    // Mouse movement parallax
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

    // 8. Dynamic Morphing Render Loop over Full Page Scroll
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Smooth mouse interpolation (Premium motion inercial physics)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Scroll progress across entire Landing Page [0.0 to 1.0]
      const p = smoothProgress.get();

      // Ambient floating particles movement
      const posArray = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posArray[i * 3] += particleSpeeds[i * 3];
        posArray[i * 3 + 1] += particleSpeeds[i * 3 + 1] + Math.sin(time + i) * 0.001;
        posArray[i * 3 + 2] += particleSpeeds[i * 3 + 2];

        // Wrap around bounds
        if (posArray[i * 3] > 2.5) posArray[i * 3] = -2.5;
        if (posArray[i * 3] < -2.5) posArray[i * 3] = 2.5;
        if (posArray[i * 3 + 1] > 3.0) posArray[i * 3 + 1] = -3.0;
        if (posArray[i * 3 + 1] < -3.0) posArray[i * 3 + 1] = 3.0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Particle visibility: Dense at top, expands outward towards the footer
      particleMat.opacity = THREE.MathUtils.lerp(0.85, 0.45, p);

      // Rotation of the strand system
      // Starts vertical & angled, then rotates gracefully into frontal alignment
      const rotX = THREE.MathUtils.lerp(0.22, 0.0, p);
      const rotY = THREE.MathUtils.lerp(-0.28, 0.0, p) + time * 0.025;
      const rotZ = THREE.MathUtils.lerp(-0.08, 0.0, p);

      strandMesh.rotation.set(rotX + mouse.y * 0.08, rotY + mouse.x * 0.1, rotZ);
      ringGroup.rotation.copy(strandMesh.rotation);
      pinLines.rotation.copy(strandMesh.rotation);
      tipInstancedMesh.rotation.copy(strandMesh.rotation);
      particleSystem.rotation.y = time * 0.015 + mouse.x * 0.05;

      // Position: Starts slightly offset to right in Hero, centers for the final bloom
      const posX = THREE.MathUtils.lerp(0.55, 0.0, p) + mouse.x * 0.05;
      const posY = THREE.MathUtils.lerp(0.15, -0.15, p) + mouse.y * 0.05;

      strandMesh.position.set(posX, posY, 0);
      ringGroup.position.set(posX, posY, 0);
      pinLines.position.set(posX, posY, 0);
      tipInstancedMesh.position.set(posX, posY, 0);
      particleSystem.position.set(posX * 0.5, posY * 0.5, 0);

      // Bloom Stage (Near the Footer: p >= 0.82)
      const bloomFactor = THREE.MathUtils.smoothstep(p, 0.82, 0.98);
      ringMat.opacity = bloomFactor * 0.9;
      outerRingMat.opacity = bloomFactor * 0.5;
      pinMat.opacity = bloomFactor * 0.8;
      warmBloomLight.intensity = THREE.MathUtils.lerp(2.8, 6.5, bloomFactor);

      // Calculate 3D curves for each strand across the 4 continuous states
      const posAttr = strandGeometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let f = 0; f < NUM_STRANDS; f++) {
        const param = strandParams[f];
        const theta = param.angle;
        let lastX = 0, lastY = 0, lastZ = 0;

        for (let s = 0; s < POINTS_PER_STRAND; s++) {
          const t = s / (POINTS_PER_STRAND - 1);
          const vertexIdx = (f * POINTS_PER_STRAND + s) * 3;

          // ==============================================================
          // STATE 1: Volumetric Braided Cable dropping from top (Hero)
          // ==============================================================
          // Tightly twisted cable bundle with volumetric thickness
          const cableSpiral = theta + (1.0 - t) * param.twistSpeed;
          const cableRadius = 0.16 + t * 0.22 + Math.sin(t * Math.PI) * 0.1;
          const cableY = 2.4 - t * 2.8;
          const cableX = Math.cos(cableSpiral) * cableRadius;
          const cableZ = Math.sin(cableSpiral) * cableRadius;

          // ==============================================================
          // STATE 2: Gracefully Untwisting & Spreading (Features & n8n)
          // ==============================================================
          const splayRadius = 0.2 + Math.pow(t, 1.3) * 1.55 * param.radiusMult;
          const splayAngle = theta + Math.sin(t * param.waveFreq + param.wavePhase + time * 0.7) * 0.18;
          const splayY = 1.8 - t * 3.2;
          const splayX = Math.cos(splayAngle) * splayRadius;
          const splayZ = Math.sin(splayAngle) * splayRadius;

          // ==============================================================
          // STATE 3: Radial 3D Torus Shaping (Hospital Otorrinos & Metrics)
          // ==============================================================
          const torusInner = 0.52;
          const torusOuter = 1.55 * param.radiusMult;
          const torusR = torusInner + t * (torusOuter - torusInner);
          const torusAngle = theta + Math.sin(t * Math.PI) * 0.25;
          const torusZ = Math.sin(t * Math.PI) * 0.32;
          const torusX = Math.cos(torusAngle) * torusR;
          const torusY = Math.sin(torusAngle) * torusR;

          // ==============================================================
          // STATE 4: Harmonious Explosive Floral Bloom (Footer / Climax)
          // ==============================================================
          // The strands burst outward into a radiant circular corona/flower
          const bloomInner = 0.6;
          // Tips shoot outward in a grand explosive corona
          const bloomOuter = 2.15 * param.radiusMult;
          const bloomR = bloomInner + Math.pow(t, 0.85) * (bloomOuter - bloomInner);
          // Radial petal wave
          const petalWave = Math.sin(theta * 6.0 + t * 4.0) * 0.08;
          const bloomAngle = theta + petalWave;
          const bloomZ = Math.sin(t * Math.PI * 0.7) * 0.18;
          const bloomX = Math.cos(bloomAngle) * bloomR;
          const bloomY = Math.sin(bloomAngle) * bloomR;

          // Smooth 4-stage continuous interpolation across LP scroll
          let currentX = 0, currentY = 0, currentZ = 0;

          if (p < 0.32) {
            // Hero -> Untwist
            const factor = p / 0.32;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(cableX, splayX, eased);
            currentY = THREE.MathUtils.lerp(cableY, splayY, eased);
            currentZ = THREE.MathUtils.lerp(cableZ, splayZ, eased);
          } else if (p < 0.72) {
            // Untwist -> Torus Shaping
            const factor = (p - 0.32) / 0.4;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(splayX, torusX, eased);
            currentY = THREE.MathUtils.lerp(splayY, torusY, eased);
            currentZ = THREE.MathUtils.lerp(splayZ, torusZ, eased);
          } else {
            // Torus Shaping -> Harmonious Explosive Bloom at Footer!
            const factor = (p - 0.72) / 0.28;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(torusX, bloomX, eased);
            currentY = THREE.MathUtils.lerp(torusY, bloomY, eased);
            currentZ = THREE.MathUtils.lerp(torusZ, bloomZ, eased);
          }

          // Subtle organic idle wave
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

        // Update Bulbous Glowing Tip Sphere
        dummy.position.set(lastX, lastY, lastZ);
        // Tips expand and glow brightest during the final explosive bloom
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
  }, [smoothProgress]);

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden select-none">
      {/* Fundo Lúmino: Branco acetinado, marfim e gradiente suave */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #FAF8F5 50%, #F5F0E8 100%)",
        }}
      />

      {/* Halo âmbar central suave */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-amber-400/12 blur-[150px] rounded-full pointer-events-none" />

      {/* Canvas WebGL 3D */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}

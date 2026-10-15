"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useScroll, useSpring } from "framer-motion";

export function IrisGlobalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track scroll of the entire landing page [0.0 at top -> 1.0 at footer]
  const { scrollYProgress } = useScroll();

  // Smooth spring physics for organic inertia while scrolling the entire LP
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 18,
    restDelta: 0.0008,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene & Camera Setup (Clean White Studio Space)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. High-Key Studio Lighting for White/Luminous Aesthetics
    const ambientLight = new THREE.AmbientLight(0xfffdfa, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ec, 2.6);
    keyLight.position.set(4, 7, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0f5ff, 1.2);
    fillLight.position.set(-5, 3, 5);
    scene.add(fillLight);

    const warmUnderGlow = new THREE.PointLight(0xff9e1b, 2.8, 14);
    warmUnderGlow.position.set(0, -2.8, 2.5);
    scene.add(warmUnderGlow);

    // 3. Central Concentric Aperture Rings (Iris Stage)
    const ringGroup = new THREE.Group();
    const innerRingGeo = new THREE.RingGeometry(0.55, 0.58, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1e2022,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, ringMat);
    ringGroup.add(innerRing);

    const outerRingGeo = new THREE.RingGeometry(1.65, 1.665, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    ringGroup.add(outerRing);
    scene.add(ringGroup);

    // 4. Perimeter Precision Radial Needles / Pins
    const pinCount = 36;
    const pinPositions: number[] = [];
    const pinColors: number[] = [];
    for (let p = 0; p < pinCount; p++) {
      const angle = (p / pinCount) * Math.PI * 2;
      const r1 = 1.68;
      const r2 = 1.95;
      pinPositions.push(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
      pinPositions.push(Math.cos(angle) * r2, Math.sin(angle) * r2, 0);
      pinColors.push(0.7, 0.7, 0.7, 0.5, 0.5, 0.5);
    }
    const pinGeo = new THREE.BufferGeometry();
    pinGeo.setAttribute("position", new THREE.Float32BufferAttribute(pinPositions, 3));
    const pinMat = new THREE.LineBasicMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0,
      linewidth: 1,
    });
    const pinLines = new THREE.LineSegments(pinGeo, pinMat);
    scene.add(pinLines);

    // 5. 3D Procedural Fibers
    const NUM_FIBERS = 124;
    const POINTS_PER_FIBER = 32;

    const fiberParams = Array.from({ length: NUM_FIBERS }, (_, i) => {
      const baseAngle = (i / NUM_FIBERS) * Math.PI * 2;
      const angleJitter = (Math.random() - 0.5) * 0.08;
      const lengthMult = 0.88 + Math.random() * 0.24;
      const spiralSpeed = 3.2 + Math.random() * 0.8;
      const waveFreq = 1.4 + Math.random() * 1.8;
      const wavePhase = Math.random() * Math.PI * 2;
      return {
        angle: baseAngle + angleJitter,
        lengthMult,
        spiralSpeed,
        waveFreq,
        wavePhase,
      };
    });

    const totalVertices = NUM_FIBERS * POINTS_PER_FIBER;
    const fiberPositions = new Float32Array(totalVertices * 3);
    const fiberColors = new Float32Array(totalVertices * 3);

    // Warm luxury golden palette: Deep Bronze -> Warm Golden Amber -> Luminous Canary
    const colorRoot = new THREE.Color("#2E1C10");
    const colorMid = new THREE.Color("#C67F26");
    const colorPreTip = new THREE.Color("#F7A725");
    const colorTip = new THREE.Color("#FFF37A");

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

    // 6. Glowing Fiber Tip Spheres
    const tipSphereGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const tipSphereMat = new THREE.MeshBasicMaterial({ color: 0xffea60 });
    const tipInstancedMesh = new THREE.InstancedMesh(tipSphereGeo, tipSphereMat, NUM_FIBERS);
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

    // 7. Morphing Render Loop over the Full Page Scroll Progress
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Global scroll progress [0.0 to 1.0] across the entire Landing Page!
      const p = smoothProgress.get();

      // Progressive 3D Rotation across the whole LP journey
      const baseRotX = THREE.MathUtils.lerp(0.18, 0.0, p);
      const baseRotY = THREE.MathUtils.lerp(-0.25, 0.0, p);
      const orbitAngle = time * 0.035;

      fiberMesh.rotation.x = baseRotX + mouse.y * 0.1;
      fiberMesh.rotation.y = baseRotY + mouse.x * 0.12 + orbitAngle;
      fiberMesh.rotation.z = 0;

      ringGroup.rotation.copy(fiberMesh.rotation);
      pinLines.rotation.copy(fiberMesh.rotation);
      tipInstancedMesh.rotation.copy(fiberMesh.rotation);

      // Keep position centered with slight parallax offset
      const centerOffsetY = THREE.MathUtils.lerp(0.25, -0.05, p);
      fiberMesh.position.y = centerOffsetY;
      ringGroup.position.y = centerOffsetY;
      pinLines.position.y = centerOffsetY;
      tipInstancedMesh.position.y = centerOffsetY;

      // Iris rings fade in during latter half of the page
      const irisFade = THREE.MathUtils.smoothstep(p, 0.52, 0.92);
      ringMat.opacity = irisFade * 0.85;
      outerRingMat.opacity = irisFade * 0.45;
      pinMat.opacity = irisFade * 0.75;

      // Calculate the progressive untwisting and morphing of the strands
      const posAttr = fiberGeometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let f = 0; f < NUM_FIBERS; f++) {
        const param = fiberParams[f];
        const theta = param.angle;
        let lastX = 0, lastY = 0, lastZ = 0;

        for (let s = 0; s < POINTS_PER_FIBER; s++) {
          const t = s / (POINTS_PER_FIBER - 1);
          const vertexIdx = (f * POINTS_PER_FIBER + s) * 3;

          // State 1: Cable Trançado Vertical (Hero / Início)
          const cableSpiral = theta + (1.0 - t) * param.spiralSpeed;
          const cableRadius = 0.12 + t * 0.16 + Math.sin(t * Math.PI) * 0.08;
          const cableY = 2.1 - t * 2.6;
          const cableX = Math.cos(cableSpiral) * cableRadius;
          const cableZ = Math.sin(cableSpiral) * cableRadius;

          // State 2: Fibras se soltando e se espalhando para baixo (Meio da página)
          const splayRadius = 0.12 + Math.pow(t, 1.4) * 1.4 * param.lengthMult;
          const splayAngle = theta + Math.sin(t * param.waveFreq + param.wavePhase + time * 0.8) * 0.15;
          const splayY = 1.6 - t * 2.8;
          const splayX = Math.cos(splayAngle) * splayRadius;
          const splayZ = Math.sin(splayAngle) * splayRadius;

          // State 3: Íris Circular Radiante Completa (Final da página)
          const irisInnerR = 0.56;
          const irisOuterR = 1.54 * param.lengthMult;
          const irisRadius = irisInnerR + t * (irisOuterR - irisInnerR);
          const irisAngle = theta + Math.sin(t * Math.PI) * 0.22 + Math.cos(theta * 3.0) * 0.06;
          const irisDomeZ = Math.sin(t * Math.PI) * 0.22 * (1.0 - t * 0.4);
          const irisX = Math.cos(irisAngle) * irisRadius;
          const irisY = Math.sin(irisAngle) * irisRadius;
          const irisZ = irisDomeZ;

          // Interpolação suave ao longo de 100% da página
          let currentX = 0, currentY = 0, currentZ = 0;

          if (p <= 0.45) {
            const factor = p / 0.45;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(cableX, splayX, eased);
            currentY = THREE.MathUtils.lerp(cableY, splayY, eased);
            currentZ = THREE.MathUtils.lerp(cableZ, splayZ, eased);
          } else {
            const factor = (p - 0.45) / 0.55;
            const eased = THREE.MathUtils.smoothstep(factor, 0, 1);
            currentX = THREE.MathUtils.lerp(splayX, irisX, eased);
            currentY = THREE.MathUtils.lerp(splayY, irisY, eased);
            currentZ = THREE.MathUtils.lerp(splayZ, irisZ, eased);
          }

          // Micro-respiração orgânica
          const idleWave = Math.sin(time * 1.2 + f * 0.15 + t * 4.0) * 0.015 * (1.0 - p * 0.5);
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

        // Atualiza a posição da esfera de luz na ponta da fibra
        dummy.position.set(lastX, lastY, lastZ);
        const tipScale = THREE.MathUtils.lerp(0.9, 1.3, p);
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

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden select-none">
      {/* Fundo Eclético em Tons Brancos e Gradientes Lúminos (Conforme pedido) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #FAF8F5 50%, #F5F1E8 100%)",
        }}
      />

      {/* Sutil brilho âmbar sob a parte central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Canvas 3D de Fibras Ópticas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}

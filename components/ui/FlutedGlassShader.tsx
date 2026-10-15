"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface FlutedGlassShaderProps {
  className?: string;
  ribCount?: number;
  speed?: number;
}

export function FlutedGlassShader({
  className = "",
  ribCount = 26.0,
  speed = 0.35,
}: FlutedGlassShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl2", {
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }) ||
      (canvas.getContext("webgl", {
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }) as WebGLRenderingContext | null);

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Vertex Shader: Fullscreen quad
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Fluted Glass Refraction with Sunset Spectrum
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_ribs;

      // Simplex / FBM noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,
                            0.366025403784439,
                           -0.577350269189626,
                            0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
              + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.52;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.48), sin(0.48), -sin(0.48), cos(0.48));
        for (int i = 0; i < 4; ++i) {
          v += a * snoise(p);
          p = rot * p * 2.05 + shift;
          a *= 0.49;
        }
        return v;
      }

      // Sunset gradient spectrum function matching reference image
      vec3 getSunsetSpectrum(vec2 uv, float t) {
        // Fluid domain warping
        vec2 q = vec2(
          fbm(uv * 1.4 + vec2(t * 0.12, -t * 0.08)),
          fbm(uv * 1.4 + vec2(-t * 0.1, t * 0.14))
        );
        vec2 r = vec2(
          fbm(uv * 2.2 + 3.8 * q + vec2(t * 0.18, -t * 0.15)),
          fbm(uv * 2.2 + 3.8 * q + vec2(-t * 0.14, t * 0.2))
        );

        float f = fbm(uv * 1.1 + 2.8 * r);

        // Curated Reference Color Palette:
        // Left: Lavender / Soft Violet
        vec3 cLavender = vec3(0.60, 0.46, 0.76);
        // Mid-Left: Mauve / Orchid Magenta
        vec3 cMauve    = vec3(0.82, 0.35, 0.65);
        // Center: Intense Coral Pink
        vec3 cCoral    = vec3(0.96, 0.34, 0.48);
        // Center-Right: Radiant Vermillion Red
        vec3 cRed      = vec3(0.98, 0.26, 0.28);
        // Lower-Right: Warm Amber / Apricot
        vec3 cAmber    = vec3(1.00, 0.68, 0.36);
        // Far Corner: Golden Honey Yellow
        vec3 cGold     = vec3(1.00, 0.88, 0.52);

        // Fluid diagonal gradient sweep
        float diag = (uv.x * 0.72 + (1.0 - uv.y) * 0.48);
        float blend = clamp(diag + f * 0.32, 0.0, 1.0);

        vec3 col = cLavender;
        col = mix(col, cMauve,   smoothstep(0.04, 0.26, blend));
        col = mix(col, cCoral,   smoothstep(0.22, 0.50, blend));
        col = mix(col, cRed,     smoothstep(0.45, 0.70, blend));
        col = mix(col, cAmber,   smoothstep(0.66, 0.88, blend));
        col = mix(col, cGold,    smoothstep(0.84, 1.00, blend));

        // Add soft luminosity boost
        col += vec3(0.05, 0.015, 0.03) * (1.0 - uv.y);
        return col;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;

        // Fluted glass cylindrical ribs
        float ribWidth = 1.0 / u_ribs;
        float ribX = fract(uv.x * u_ribs);
        
        // Physical cylindrical curvature normal: x in [-1.0, 1.0]
        float localX = (ribX - 0.5) * 2.0;
        // Circular arc depth profile
        float localZ = sqrt(max(0.001, 1.0 - localX * localX * 0.88));

        // Surface normal in 2D
        vec2 ribNormal = vec2(localX, 0.0);

        // Subtle mouse ripple caustics
        vec2 mouseNorm = u_mouse / u_resolution;
        vec2 mouseDelta = uv - mouseNorm;
        mouseDelta.x *= aspect;
        float mouseDist = length(mouseDelta);
        float mouseGlow = exp(-mouseDist * 3.5) * 0.045;
        vec2 mouseRefract = normalize(mouseDelta + 0.0001) * mouseGlow;

        // Chromatic dispersion parameters
        float baseRefract = 0.046;
        float dispersion  = 0.014;

        vec2 uvR = uv + ribNormal * (baseRefract + dispersion) + mouseRefract;
        vec2 uvG = uv + ribNormal * baseRefract + mouseRefract;
        vec2 uvB = uv + ribNormal * (baseRefract - dispersion) + mouseRefract;

        float t = u_time;
        vec3 colR = getSunsetSpectrum(uvR, t);
        vec3 colG = getSunsetSpectrum(uvG, t);
        vec3 colB = getSunsetSpectrum(uvB, t);

        vec3 finalColor = vec3(colR.r, colG.g, colB.b);

        // Specular highlight: glossy light sheen along the cylinder crest
        vec3 lightDir = normalize(vec3(0.35, 0.70, 0.62));
        vec3 normal3D = normalize(vec3(localX, 0.0, localZ));
        float spec = pow(max(0.0, dot(normal3D, lightDir)), 16.0) * 0.38;

        // Rib groove shadow: subtle darker seam between adjacent ribs
        float grooveShadow = smoothstep(0.0, 0.16, ribX) * smoothstep(1.0, 0.84, ribX);
        grooveShadow = mix(0.72, 1.0, grooveShadow);

        // Secondary subtle specular line at edge
        float edgeGlint = pow(abs(localX), 6.0) * 0.15;

        finalColor *= grooveShadow;
        finalColor += vec3(spec * 0.85 + edgeGlint * 0.5);

        // Subtle vignette at the border of the card
        float borderVignette = smoothstep(0.0, 0.04, uv.x) * smoothstep(1.0, 0.96, uv.x) *
                               smoothstep(0.0, 0.04, uv.y) * smoothstep(1.0, 0.96, uv.y);
        finalColor *= mix(0.92, 1.0, borderVignette);

        gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
      }
    `;

    function createShader(
      glCtx: WebGLRenderingContext,
      type: number,
      source: string
    ) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error("Shader compile error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
      setWebglSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      setWebglSupported(false);
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPositionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uRibsLoc = gl.getUniformLocation(program, "u_ribs");

    let animationFrameId: number;
    let startTime = performance.now();
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouse.targetX = (e.clientX - rect.left) * dpr;
      mouse.targetY = (rect.height - (e.clientY - rect.top)) * dpr;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvas || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouse.targetX = (touch.clientX - rect.left) * dpr;
      mouse.targetY = (rect.height - (touch.clientY - rect.top)) * dpr;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    handleResize();

    // Initialize mouse in the center
    if (canvas) {
      mouse.x = mouse.targetX = canvas.width * 0.5;
      mouse.y = mouse.targetY = canvas.height * 0.5;
    }

    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001 * speed;

      // Smooth mouse interpolation (Premium Motion Physics)
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uMouseLoc, mouse.x, mouse.y);
      gl.uniform1f(uRibsLoc, ribCount);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (program) gl.deleteProgram(program);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
    };
  }, [ribCount, speed]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover block"
        />
      ) : (
        // High-fidelity fallback CSS gradient if WebGL is unavailable
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "linear-gradient(135deg, #8B5CF6 0%, #EC4899 35%, #F43F5E 60%, #FB923C 85%, #FDE047 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 14px, rgba(0,0,0,0.15) 15px, rgba(0,0,0,0.15) 16px)",
            }}
          />
        </div>
      )}

      {/* Subtle glossy glass surface overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/10 via-transparent to-white/20" />
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/20 rounded-[inherit]" />
    </div>
  );
}

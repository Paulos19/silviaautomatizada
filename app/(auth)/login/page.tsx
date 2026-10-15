"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { FlutedGlassShader } from "@/components/ui/FlutedGlassShader";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-white text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
      {/* Centered Dual-Panel Layout Container */}
      <div className="w-full max-w-[1240px] min-h-[720px] lg:h-[calc(100vh-64px)] lg:max-h-[820px] grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
        
        {/* ================================================================ */}
        {/* LEFT PANEL: Fluted Glass Sunset Shader Art (Canvas-UI / Motion)  */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, x: -16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.4, 0, 0.2, 1], // Premium archetype curve
          }}
          className="relative w-full h-[380px] sm:h-[460px] lg:h-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-rose-950/10 border border-slate-200/70"
        >
          {/* WebGL Fluted Glass Shader with Sunset Refraction */}
          <FlutedGlassShader
            ribCount={26}
            speed={0.38}
            className="w-full h-full"
          />

          {/* Floating Luxury Glassmorphism Badge */}
          <div className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white text-xs font-medium tracking-wide shadow-lg select-none">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-sans">Silvia Health OS</span>
            <span className="text-white/40">•</span>
            <span className="text-white/80 font-normal">v2.4</span>
          </div>

          {/* Bottom subtle ambient badge */}
          <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between text-white/70 text-[11px] font-sans px-2 pointer-events-none select-none">
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ambiente Seguro Criptografado</span>
            </div>
            <span className="hidden sm:inline-block bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
              Refração Canelada • WebGL2
            </span>
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* RIGHT PANEL: Clean Luxury Authentication Form                     */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.08,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="w-full max-w-[400px] mx-auto flex flex-col justify-center px-2 sm:px-4 py-4 lg:py-8"
        >
          {/* Header Typography (Faithful to Reference) */}
          <div className="mb-7">
            <h1 className="text-3xl sm:text-[34px] font-bold tracking-tight text-slate-900 font-sans leading-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 font-normal mt-2 font-sans">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form Component */}
          <LoginForm />

          {/* Footer Navigation Link */}
          <div className="text-center mt-7">
            <p className="text-sm text-slate-500 font-sans">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-slate-900 hover:underline transition-all underline-offset-2 ml-1"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
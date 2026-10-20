"use client";

import React from "react";
import { useGlassTheme } from "./ThemeContext";

export function GlassBackground() {
  const { theme } = useGlassTheme();

  const getThemeGradients = () => {
    switch (theme) {
      case "emerald":
        return {
          bg: "bg-gradient-to-br from-[#021f18] via-[#042f24] to-[#01140f] text-emerald-50",
          orb1: "bg-emerald-500/35",
          orb2: "bg-teal-400/30",
          orb3: "bg-cyan-500/25",
          orb4: "bg-green-500/20",
        };
      case "sunset":
        return {
          bg: "bg-gradient-to-br from-[#1a050f] via-[#2c0e1e] to-[#0f030a] text-orange-50",
          orb1: "bg-rose-500/35",
          orb2: "bg-orange-500/30",
          orb3: "bg-amber-400/25",
          orb4: "bg-pink-600/25",
        };
      case "obsidian":
        return {
          bg: "bg-gradient-to-br from-[#050507] via-[#0b0b10] to-[#030304] text-slate-100",
          orb1: "bg-slate-700/30",
          orb2: "bg-zinc-600/20",
          orb3: "bg-neutral-700/20",
          orb4: "bg-slate-800/30",
        };
      case "nebula":
      default:
        return {
          bg: "bg-gradient-to-br from-[#070b16] via-[#0d162d] to-[#060914] text-white",
          orb1: "bg-cyan-500/25",
          orb2: "bg-indigo-600/30",
          orb3: "bg-purple-600/25",
          orb4: "bg-sky-500/20",
        };
    }
  };

  const style = getThemeGradients();

  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-700 ${style.bg}`}>
      {/* Floating Animated Liquid Orbs */}
      <div
        className={`absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[100px] animate-float-1 ${style.orb1}`}
      />
      <div
        className={`absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[120px] animate-float-2 ${style.orb2}`}
      />
      <div
        className={`absolute bottom-[-15%] left-[20%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full blur-[110px] animate-float-3 ${style.orb3}`}
      />
      <div
        className={`absolute top-[60%] left-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full blur-[90px] animate-float-1 ${style.orb4}`}
      />

      {/* Glass Frost Mesh Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top subtle glow bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
    </div>
  );
}

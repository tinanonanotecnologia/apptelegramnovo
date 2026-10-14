"use client";

import React from "react";
import { Compass, Flame, Layers, Dices, Heart, Plus } from "lucide-react";
import { useGlassTheme } from "./ThemeContext";

interface GlassDockProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSubmit: () => void;
  onOpenRoulette: () => void;
}

export function GlassDock({
  activeTab,
  setActiveTab,
  onOpenSubmit,
  onOpenRoulette,
}: GlassDockProps) {
  const { favorites } = useGlassTheme();

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 md:hidden flex justify-center px-4 pointer-events-none">
      <div className="glass-dock rounded-3xl p-1.5 px-3 flex items-center justify-between gap-1 max-w-sm w-full pointer-events-auto border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        {/* Explorar */}
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex-1 py-1.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === "explore"
              ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-medium"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px]">Explorar</span>
        </button>

        {/* Tendências */}
        <button
          onClick={() => setActiveTab("trending")}
          className={`flex-1 py-1.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === "trending"
              ? "bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-medium"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span className="text-[10px]">Em Alta</span>
        </button>

        {/* Central Submit Button */}
        <button
          onClick={onOpenSubmit}
          className="mx-1 w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95 transition-transform"
          title="Adicionar Canal"
        >
          <Plus className="w-5 h-5 text-white stroke-[2.5]" />
        </button>

        {/* Roleta */}
        <button
          onClick={onOpenRoulette}
          className="flex-1 py-1.5 rounded-2xl flex flex-col items-center gap-0.5 text-slate-400 hover:text-white transition-all"
        >
          <Dices className="w-4 h-4 text-cyan-300" />
          <span className="text-[10px]">Roleta</span>
        </button>

        {/* Favoritos */}
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex-1 py-1.5 rounded-2xl flex flex-col items-center gap-0.5 relative transition-all ${
            activeTab === "favorites"
              ? "bg-rose-500/20 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-medium"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-[10px]">Favoritos</span>
          {favorites.length > 0 && (
            <span className="absolute top-1 right-3 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

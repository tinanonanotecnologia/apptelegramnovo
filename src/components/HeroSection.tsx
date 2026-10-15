"use client";

import React from "react";
import {
  Search,
  Sparkles,
  Dices,
  Flame,
  ShieldCheck,
  Users,
  Send,
  X,
  Layers,
} from "lucide-react";
import { PlatformStats } from "@/lib/types";
import { formatMemberCount } from "@/lib/utils";

interface HeroSectionProps {
  stats: PlatformStats | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  onOpenRoulette: () => void;
}

const TYPE_FILTERS = [
  { id: "all", label: "Todos os Tipos", icon: Layers },
  { id: "channel", label: "Canais", icon: Send },
  { id: "group", label: "Grupos", icon: Users },
  { id: "bot", label: "Bots & IA", icon: Sparkles },
  { id: "sticker_pack", label: "Stickers", icon: Flame },
];

export function HeroSection({
  stats,
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  onOpenRoulette,
}: HeroSectionProps) {
  return (
    <section className="relative w-full pt-4 pb-6 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Frosted Glass Hero Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border-white/15 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          {/* Subtle Ambient Refraction Glare */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
            {/* Live Stats Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border-cyan-400/30 text-cyan-200 text-xs font-medium shadow-[0_0_15px_rgba(56,189,248,0.2)] animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>
                {stats
                  ? `${stats.totalLinks} canais curados • ${formatMemberCount(stats.totalMembers)} membros • ${formatMemberCount(stats.totalClicks)} cliques`
                  : "O seu ponto de encontro no Telegram"}
              </span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              O ponto de encontro das{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent underline decoration-cyan-400/30 decoration-wavy">
                comunidades do Telegram
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
              Encontre comunidades ativas, canais especializados, bots úteis, promoções, cursos e muito mais. Tudo organizado para você descobrir, conectar-se e participar.
            </p>

            {/* Interactive Glass Search Bar */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4.5 w-5 h-5 text-cyan-300/80 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Pesquisar canais, @arroba, bots, IA, cursos ou tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl glass-input text-sm sm:text-base text-white placeholder-slate-400 shadow-xl border-white/20 focus:border-cyan-400/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Type Filter Pills */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap pt-2">
              {TYPE_FILTERS.map((f) => {
                const Icon = f.icon;
                const isActive = selectedType === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedType(f.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)] scale-105"
                        : "glass-pill text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{f.label}</span>
                  </button>
                );
              })}

              {/* Roulette button */}
              <button
                onClick={onOpenRoulette}
                className="px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/40 text-purple-200 hover:text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all cursor-pointer active:scale-95"
              >
                <Dices className="w-3.5 h-3.5 text-pink-300 animate-spin-slow" />
                <span>Roleta Aleatória</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

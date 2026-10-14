"use client";

import React, { useRef } from "react";
import { CategoryItem } from "@/lib/types";
import {
  Sparkles,
  Flame,
  Star,
  Users,
  Clock,
  Heart,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Globe,
} from "lucide-react";
import { getCategoryIconComponent } from "@/lib/utils";

interface FilterBarProps {
  categories: CategoryItem[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (verified: boolean) => void;
  totalResults: number;
}

const SORT_OPTIONS = [
  { id: "trending", label: "Em Alta", icon: Flame },
  { id: "popular", label: "Mais Membros", icon: Users },
  { id: "rating", label: "Melhores Notas", icon: Star },
  { id: "likes", label: "Mais Curtidos", icon: Heart },
  { id: "newest", label: "Mais Recentes", icon: Clock },
];

export function FilterBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  selectedLanguage,
  setSelectedLanguage,
  verifiedOnly,
  setVerifiedOnly,
  totalResults,
}: FilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const amount = direction === "left" ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full space-y-4 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Category Pill Carousel with Smooth Arrows */}
        <div className="relative group">
          {/* Left scroll fade button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-white -ml-2 sm:-ml-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex cursor-pointer"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable pill container */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1"
          >
            {/* "Todos" pill */}
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                  : "glass-pill text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Todas as Categorias</span>
            </button>

            {/* Category pills */}
            {categories.map((cat) => {
              const Icon = getCategoryIconComponent(cat.icon);
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)] font-semibold"
                      : "glass-pill text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{cat.name}</span>
                  {typeof cat.linksCount === "number" && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-slate-300">
                      {cat.linksCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right scroll fade button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-white -mr-2 sm:-mr-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex cursor-pointer"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary controls row: Sort, Language & Verified */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Sorting buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">
              Ordenar por:
            </span>
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedSort === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedSort(opt.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm font-medium"
                      : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                  }`}
                >
                  <Icon className="w-3 h-3 text-cyan-300" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Language & Verified Filter Controls */}
          <div className="flex items-center gap-2">
            {/* Language filter */}
            <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                onClick={() => setSelectedLanguage("all")}
                className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                  selectedLanguage === "all"
                    ? "bg-cyan-500/25 text-cyan-200 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedLanguage("pt")}
                className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                  selectedLanguage === "pt"
                    ? "bg-cyan-500/25 text-cyan-200 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇧🇷 PT-BR
              </button>
              <button
                onClick={() => setSelectedLanguage("global")}
                className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                  selectedLanguage === "global"
                    ? "bg-cyan-500/25 text-cyan-200 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🌐 Global
              </button>
            </div>

            {/* Verified toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                verifiedOnly
                  ? "bg-blue-500/20 text-blue-200 border border-blue-400/40 shadow-[0_0_10px_rgba(59,130,246,0.3)] font-semibold"
                  : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Verificados</span>
            </button>
          </div>
        </div>

        {/* Results Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
          <span>
            Mostrando <strong className="text-cyan-200">{totalResults}</strong> canais e bots
          </span>
        </div>
      </div>
    </div>
  );
}

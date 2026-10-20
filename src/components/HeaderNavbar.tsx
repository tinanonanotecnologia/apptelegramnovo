"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Dices,
  Plus,
  Heart,
  Palette,
  ShieldCheck,
  Search,
  Flame,
  Check,
  Bell,
} from "lucide-react";
import { useGlassTheme, GlassTheme } from "./ThemeContext";
import { PlatformStats } from "@/lib/types";

interface HeaderNavbarProps {
  stats: PlatformStats | null;
  onOpenSubmit: () => void;
  onOpenRoulette: () => void;
  onOpenAdmin: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const THEME_OPTIONS: { id: GlassTheme; label: string; dotColor: string }[] = [
  { id: "nebula", label: "Nebula Glass", dotColor: "bg-cyan-400" },
  { id: "emerald", label: "Emerald Glass", dotColor: "bg-emerald-400" },
  { id: "sunset", label: "Sunset Prism", dotColor: "bg-orange-400" },
  { id: "obsidian", label: "Obsidian Dark", dotColor: "bg-zinc-400" },
];

export function HeaderNavbar({
  stats,
  onOpenSubmit,
  onOpenRoulette,
  onOpenAdmin,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}: HeaderNavbarProps) {
  const { theme, setTheme, favorites } = useGlassTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({ approved: true, highlights: true, announcements: true });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("telegram_hub_notification_preferences");
      if (saved) setNotificationPrefs((current) => ({ ...current, ...JSON.parse(saved) }));
    } catch {}
  }, []);

  const toggleNotificationPreference = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem("telegram_hub_notification_preferences", JSON.stringify(next));
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl sm:rounded-3xl px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab("explore")}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-2xl border border-cyan-400/40 shadow-[0_0_20px_rgba(56,189,248,0.3)] group-hover:scale-105 transition-transform">
            <Image
              src="/icons/icon-512.png"
              alt="Telegram Hub"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                Telegram Hub
              </span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-white/10 text-cyan-300 border border-cyan-400/20 hidden sm:inline-block">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-slate-300 hidden sm:block -mt-0.5">
              Descubra. Conecte. Compartilhe.
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "explore"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Explorar
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "trending"
                ? "bg-amber-500/20 text-amber-200 border border-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Em Alta
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "collections"
                ? "bg-purple-500/20 text-purple-200 border border-purple-400/30 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Coleções
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "favorites"
                ? "bg-rose-500/20 text-rose-200 border border-rose-400/30 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Favoritos
            {favorites.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500/40 text-rose-200 text-[10px] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Random Roulette Discovery */}
          <button
            onClick={onOpenRoulette}
            className="p-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl glass-pill text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Descobrir Canal Aleatório"
          >
            <Dices className="w-4 h-4 animate-spin-slow text-cyan-300" />
            <span className="hidden lg:inline">Roleta</span>
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu((visible) => !visible)}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl glass-pill text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Preferências de notificações"
              aria-label="Preferências de notificações"
            >
              <Bell className="w-4 h-4 text-violet-300" />
            </button>
            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-modal p-3 shadow-2xl z-50 border border-white/20">
                <div className="px-1 py-1 text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Notificações</div>
                <p className="px-1 pb-2 text-[11px] text-slate-500">Escolha os avisos que deseja receber.</p>
                {([
                  ["approved", "Links aprovados"],
                  ["highlights", "Destaques"],
                  ["announcements", "Comunicados"] as const,
                ] as const).map(([key, label]) => (
                  <button key={key} onClick={() => toggleNotificationPreference(key)} className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs text-slate-200 hover:bg-white/5">
                    {label}
                    <span className={`h-4 w-7 rounded-full p-0.5 transition-colors ${notificationPrefs[key] ? "bg-violet-500" : "bg-slate-700"}`}>
                      <span className={`block h-3 w-3 rounded-full bg-white transition-transform ${notificationPrefs[key] ? "translate-x-3" : "translate-x-0"}`} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl glass-pill text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Mudar Tema do Vidro"
            >
              <Palette className="w-4 h-4 text-slate-200" />
            </button>

            {showThemeMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-2xl glass-modal p-2 shadow-2xl z-50 border border-white/20 animate-in fade-in slide-in-from-top-2 duration-200"
                onClick={() => setShowThemeMenu(false)}
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Temas do Vidro
                </div>
                <div className="space-y-1 mt-1">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between text-left transition-colors ${
                        theme === opt.id
                          ? "bg-white/15 text-white font-medium"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor}`} />
                        <span>{opt.label}</span>
                      </div>
                      {theme === opt.id && <Check className="w-3.5 h-3.5 text-cyan-300" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin / Moderation Panel Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl glass-pill text-slate-300 hover:text-white transition-all cursor-pointer hidden sm:flex"
            title="Painel de Moderação & Gestão"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Submit Link Action */}
          <button
            onClick={onOpenSubmit}
            className="px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl glass-button text-xs font-semibold text-white flex items-center gap-1.5 shadow-[0_0_20px_rgba(56,189,248,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>Sugerir Link</span>
          </button>
        </div>
      </div>
    </header>
  );
}

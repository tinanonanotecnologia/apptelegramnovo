"use client";

import React, { useEffect, useRef, useState } from "react";
import { TelegramLinkItem } from "@/lib/types";
import { TelegramCard } from "./TelegramCard";
import { Heart, Download, Upload, Compass, Sparkles } from "lucide-react";
import { useGlassTheme } from "./ThemeContext";

interface FavoritesViewProps {
  allLinks: TelegramLinkItem[];
  onOpenDetails: (link: TelegramLinkItem) => void;
  onOpenQr: (link: TelegramLinkItem) => void;
  onExplore: () => void;
  showToast?: (msg: string) => void;
}

export function FavoritesView({
  allLinks,
  onOpenDetails,
  onOpenQr,
  onExplore,
  showToast,
}: FavoritesViewProps) {
  const { favorites } = useGlassTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [additionalLinks, setAdditionalLinks] = useState<TelegramLinkItem[]>([]);

  useEffect(() => {
    const loadedIds = new Set(allLinks.map((link) => link.id));
    const missingIds = favorites.filter((id) => !loadedIds.has(id));

    if (missingIds.length === 0) {
      return;
    }

    let cancelled = false;
    void Promise.all(
      missingIds.map(async (id) => {
        try {
          const response = await fetch(`/api/links/${id}`);
          const payload = await response.json();
          return payload.success ? (payload.data as TelegramLinkItem) : null;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (!cancelled) {
        setAdditionalLinks(results.filter((link): link is TelegramLinkItem => Boolean(link)));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [allLinks, favorites]);

  const linksById = new Map([...allLinks, ...additionalLinks].map((link) => [link.id, link]));
  const favoritedLinks = favorites
    .map((id) => linksById.get(id))
    .filter((link): link is TelegramLinkItem => Boolean(link));

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(favoritedLinks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telegram-hub-favoritos-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (showToast) showToast("Backup de favoritos exportado com sucesso!");
  };

  return (
    <div className="w-full py-4 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-3xl p-6 border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
              <Heart className="w-6 h-6 fill-rose-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Meus Favoritos Salvos</h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {favoritedLinks.length} canais e bots guardados no seu dispositivo.
              </p>
            </div>
          </div>

          {favoritedLinks.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-3.5 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-300" />
                <span>Exportar Backup</span>
              </button>
            </div>
          )}
        </div>

        {/* Links Grid or Empty State */}
        {favoritedLinks.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border-white/15">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center text-rose-300">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Nenhum canal favoritado ainda</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore os canais e toque no ícone de coração para salvar seus canais favoritos nesta aba.
            </p>
            <button
              onClick={onExplore}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explorar Canais Agora</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {favoritedLinks.map((link) => (
              <TelegramCard
                key={link.id}
                link={link}
                onOpenDetails={onOpenDetails}
                onOpenQr={onOpenQr}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

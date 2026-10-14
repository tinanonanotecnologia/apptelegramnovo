"use client";

import React, { useState } from "react";
import { TelegramLinkItem } from "@/lib/types";
import {
  Send,
  Users,
  Star,
  CheckCircle2,
  Heart,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Flame,
  ThumbsUp,
} from "lucide-react";
import { formatMemberCount, getTypeBadge, triggerConfetti } from "@/lib/utils";
import { useGlassTheme } from "./ThemeContext";

interface TelegramCardProps {
  link: TelegramLinkItem;
  onOpenDetails: (link: TelegramLinkItem) => void;
  onOpenQr: (link: TelegramLinkItem) => void;
  onLinkUpdated?: (updated: TelegramLinkItem) => void;
  showToast?: (msg: string) => void;
}

export function TelegramCard({
  link,
  onOpenDetails,
  onOpenQr,
  onLinkUpdated,
  showToast,
}: TelegramCardProps) {
  const { isFavorite, toggleFavorite } = useGlassTheme();
  const [copied, setCopied] = useState(false);
  const [likesCount, setLikesCount] = useState(link.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const favorited = isFavorite(link.id);
  const typeBadge = getTypeBadge(link.type);
  const TypeIcon = typeBadge.icon;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      triggerConfetti();
      if (showToast) showToast(`Link ${link.handle} copiado com sucesso!`);
      setTimeout(() => setCopied(false), 2000);

      // Track click/copy
      fetch(`/api/links/${link.id}/click`, { method: "POST" }).catch(() => {});
    } catch (err) {
      console.warn("Copy failed", err);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked || isLiking) return;
    setIsLiking(true);
    setHasLiked(true);
    setLikesCount((prev) => prev + 1);

    try {
      const res = await fetch(`/api/links/${link.id}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success && onLinkUpdated) {
        onLinkUpdated({ ...link, likesCount: data.likesCount });
      }
      if (showToast) showToast(`Você curtiu ${link.title}!`);
    } catch (err) {
      console.warn("Like failed", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleOpenDirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetch(`/api/links/${link.id}/click`, { method: "POST" }).catch(() => {});
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(link.id);
    if (showToast) {
      showToast(
        favorited ? `Removido dos favoritos: ${link.title}` : `Salvo nos favoritos: ${link.title}`
      );
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(link)}
      className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between group cursor-pointer border-white/12 hover:border-cyan-400/40 relative"
    >
      {/* Top row: Type badge, verified badge & favorite button */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${typeBadge.bg}`}
            >
              <TypeIcon className="w-3 h-3" />
              <span>{typeBadge.label}</span>
            </span>

            {link.isFeatured && (
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> Destaque
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Favorite button */}
            <button
              onClick={handleToggleFav}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                favorited
                  ? "bg-rose-500/25 text-rose-300 border border-rose-400/40 shadow-sm"
                  : "text-slate-400 hover:text-rose-300 hover:bg-white/5"
              }`}
              title={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
            >
              <Heart className={`w-4 h-4 ${favorited ? "fill-rose-400" : ""}`} />
            </button>

            {/* QR Code peek button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQr(link);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
              title="Ver QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Link Header: Title & Handle */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
              {link.title}
            </h3>
            {link.isVerified && (
              <span title="Canal Verificado & Seguro">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 fill-cyan-400/20" />
              </span>
            )}
          </div>

          <p className="text-xs font-medium text-cyan-300/90 font-mono tracking-tight">
            {link.handle}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300/90 mt-2.5 line-clamp-2 leading-relaxed">
          {link.description}
        </p>

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mt-3">
            {link.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg text-[10px] bg-white/[0.04] text-slate-400 border border-white/5 group-hover:border-cyan-400/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span className="text-[10px] text-slate-400">+{link.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom stats & action footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        {/* Stats: Member Count + Star Rating */}
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-1" title={`${link.memberCount} membros / usuários`}>
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-white">{formatMemberCount(link.memberCount)}</span>
          </div>

          <div
            className="flex items-center gap-1 text-amber-300"
            title={`Nota ${link.ratingAvg} (${link.ratingCount} avaliações)`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-white">{link.ratingAvg}</span>
          </div>

          {/* Like mini button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
              hasLiked ? "text-cyan-300 font-semibold" : "text-slate-400 hover:text-cyan-300"
            }`}
            title="Curtir canal"
          >
            <ThumbsUp className={`w-3 h-3 ${hasLiked ? "fill-cyan-400/30" : ""}`} />
            <span>{likesCount}</span>
          </button>
        </div>

        {/* Action Buttons: Copy & Direct Open */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl glass-pill text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer"
            title="Copiar Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleOpenDirect}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(56,189,248,0.25)] active:scale-95 cursor-pointer"
            title="Abrir no Telegram"
          >
            <Send className="w-3 h-3 -rotate-12" />
            <span className="hidden sm:inline">Entrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

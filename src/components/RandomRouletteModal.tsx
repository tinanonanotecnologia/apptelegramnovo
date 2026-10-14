"use client";

import React, { useState, useEffect } from "react";
import { TelegramLinkItem } from "@/lib/types";
import {
  X,
  Dices,
  Send,
  Star,
  Users,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatMemberCount, getTypeBadge, triggerConfetti } from "@/lib/utils";

interface RandomRouletteModalProps {
  links: TelegramLinkItem[];
  onClose: () => void;
  onOpenDetails: (link: TelegramLinkItem) => void;
}

export function RandomRouletteModal({
  links,
  onClose,
  onOpenDetails,
}: RandomRouletteModalProps) {
  const [selectedLink, setSelectedLink] = useState<TelegramLinkItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinWheel = () => {
    if (links.length === 0 || isSpinning) return;
    setIsSpinning(true);

    let counter = 0;
    const maxSteps = 16;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * links.length);
      setSelectedLink(links[randomIndex]);
      counter++;

      if (counter >= maxSteps) {
        clearInterval(interval);
        const finalLink = links[Math.floor(Math.random() * links.length)];
        setSelectedLink(finalLink);
        setIsSpinning(false);
        triggerConfetti();
      }
    }, 90);
  };

  useEffect(() => {
    // Spin once when the modal opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    spinWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typeBadge = selectedLink ? getTypeBadge(selectedLink.type) : null;
  const TypeIcon = typeBadge?.icon || Send;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl">
      <div className="glass-modal max-w-md w-full rounded-3xl p-6 relative border border-white/20 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-500/30 to-pink-500/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <Dices className={`w-7 h-7 ${isSpinning ? "animate-spin" : ""}`} />
        </div>

        <h3 className="text-xl font-extrabold text-white">Roleta do Telegram</h3>
        <p className="text-xs text-slate-300 mt-1 mb-5">
          Descubra novos canais, ferramentas e comunidades de forma aleatória!
        </p>

        {/* Selected Result Card */}
        {selectedLink && (
          <div
            className={`glass-card rounded-2xl p-4 sm:p-5 border-white/20 text-left transition-all ${
              isSpinning ? "opacity-60 scale-95 blur-[1px]" : "opacity-100 scale-100 shadow-[0_0_25px_rgba(56,189,248,0.3)]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              {typeBadge && (
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${typeBadge.bg}`}
                >
                  <TypeIcon className="w-3 h-3" />
                  <span>{typeBadge.label}</span>
                </span>
              )}
              <span className="text-[11px] font-semibold text-white flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-300" />
                {formatMemberCount(selectedLink.memberCount)}
              </span>
            </div>

            <h4 className="text-base font-bold text-white truncate">{selectedLink.title}</h4>
            <p className="text-xs text-cyan-300 font-mono mb-2">{selectedLink.handle}</p>
            <p className="text-xs text-slate-300 line-clamp-2">{selectedLink.description}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="flex-1 py-3 px-4 rounded-2xl glass-pill text-xs font-semibold text-white hover:text-cyan-200 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
            <span>Girar Novamente</span>
          </button>

          {selectedLink && (
            <button
              onClick={() => {
                onOpenDetails(selectedLink);
                onClose();
              }}
              disabled={isSpinning}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span>Ver Canal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

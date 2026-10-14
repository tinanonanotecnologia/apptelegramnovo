"use client";

import React from "react";
import { CuratedCollectionItem, TelegramLinkItem } from "@/lib/types";
import { Sparkles, Flame, Bot, Code, BadgePercent, ArrowRight, ExternalLink, Send } from "lucide-react";
import { formatMemberCount } from "@/lib/utils";

interface CuratedCollectionsProps {
  collections: CuratedCollectionItem[];
  onSelectLink: (link: TelegramLinkItem) => void;
  onSelectCategory: (categoryId: string) => void;
}

export function CuratedCollections({
  collections,
  onSelectLink,
  onSelectCategory,
}: CuratedCollectionsProps) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="w-full py-4 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Coleções em Destaque
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Listas selecionadas a dedo pelos editores da comunidade.
            </p>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              className="glass-card rounded-3xl p-5 sm:p-6 border-white/15 relative overflow-hidden group hover:border-cyan-400/40"
            >
              {/* Background gradient blur */}
              <div
                className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${col.gradient} rounded-full blur-3xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity`}
              />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-cyan-200 border border-white/15">
                      {col.badge}
                    </span>
                    <span className="text-xs text-slate-400">
                      {col.links?.length || 0} canais
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mt-2 group-hover:text-cyan-200 transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {col.subtitle}
                  </p>
                </div>

                {/* Sub-items horizontal list */}
                {col.links && col.links.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {col.links.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectLink(item)}
                        className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-400/30 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                            <Send className="w-3.5 h-3.5 -rotate-12" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-cyan-300/80 truncate">
                              {item.handle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-medium text-slate-300">
                            {formatMemberCount(item.memberCount)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

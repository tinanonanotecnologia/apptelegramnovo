"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CategoryItem,
  TelegramLinkItem,
  CuratedCollectionItem,
  PlatformStats,
} from "@/lib/types";
import { HeaderNavbar } from "@/components/HeaderNavbar";
import { HeroSection } from "@/components/HeroSection";
import { CuratedCollections } from "@/components/CuratedCollections";
import { FilterBar } from "@/components/FilterBar";
import { TelegramCard } from "@/components/TelegramCard";
import { LinkDetailModal } from "@/components/LinkDetailModal";
import { SubmitLinkModal } from "@/components/SubmitLinkModal";
import { RandomRouletteModal } from "@/components/RandomRouletteModal";
import { FavoritesView } from "@/components/FavoritesView";
import { AdminModerationModal } from "@/components/AdminModerationModal";
import { GlassDock } from "@/components/GlassDock";
import { Toast } from "@/components/Toast";
import {
  Sparkles,
  Send,
  Flame,
  Search,
  Plus,
  RefreshCw,
  FolderOpen,
  ArrowUp,
  Layers,
  Heart,
  Bot,
  ExternalLink,
} from "lucide-react";
import { formatMemberCount } from "@/lib/utils";

export default function Home() {
  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<string>("explore");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("trending");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Data State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [links, setLinks] = useState<TelegramLinkItem[]>([]);
  const [collections, setCollections] = useState<CuratedCollectionItem[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Modals & Feedback State
  const [activeLinkId, setActiveLinkId] = useState<number | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (e) {
      console.warn("Failed to load categories:", e);
    }
  }, []);

  // Fetch Collections
  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/collections", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCollections(data.data || []);
      }
    } catch (e) {
      console.warn("Failed to load collections:", e);
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.warn("Failed to load stats:", e);
    }
  }, []);

  // Fetch Links based on current filters
  const fetchLinks = useCallback(async (offset = 0, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedType !== "all") params.append("type", selectedType);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedSort) params.append("sort", selectedSort);
      if (selectedLanguage !== "all") params.append("language", selectedLanguage);
      if (verifiedOnly) params.append("verified", "true");
      if (activeTab === "trending") {
        params.set("sort", "trending");
      }
      params.set("limit", "50");
      params.set("offset", String(offset));

      const res = await fetch(`/api/links?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setLinks((previous) => {
          const nextLinks = data.data || [];
          return append ? [...previous, ...nextLinks] : nextLinks;
        });
        setTotalCount(data.pagination?.total || data.data.length);
        setHasMore(Boolean(data.pagination?.hasMore));
      }
    } catch (e) {
      console.warn("Failed to load links:", e);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, [
    selectedCategory,
    selectedType,
    searchQuery,
    selectedSort,
    selectedLanguage,
    verifiedOnly,
    activeTab,
  ]);

  // Initial Data Load
  useEffect(() => {
    // These callbacks synchronize the initial server-backed catalog state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
    fetchCollections();
    fetchStats();
  }, [fetchCategories, fetchCollections, fetchStats]);

  // Reactive links load
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchLinks();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchLinks]);

  // PWA shortcuts use query parameters to open a specific app surface.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "explore" || tab === "trending" || tab === "collections" || tab === "favorites") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tab);
    }
    if (params.get("action") === "submit") {
      setIsSubmitOpen(true);
    }
  }, []);

  // Scroll to Top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkUpdated = (updated: TelegramLinkItem) => {
    setLinks((prev) => {
      // A moderation update can be delivered to an open catalog card/detail
      // modal. Remove anything that is no longer public immediately instead of
      // leaving the rejected link visible until the next full reload.
      if (updated.status !== "approved") {
        return prev.filter((link) => link.id !== updated.id);
      }
      return prev.map((link) => (link.id === updated.id ? updated : link));
    });
  };

  const handleLinkAdded = (newLink: TelegramLinkItem) => {
    if (newLink.status === "approved") {
      setLinks((prev) => [newLink, ...prev]);
      setTotalCount((prev) => prev + 1);
    } else {
      showToast("Link enviado para moderação.");
    }
    fetchCategories();
    fetchStats();
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      void fetchLinks(links.length, true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-12">
      <Toast message={toastMessage} />

      {/* Glass Top Header */}
      <HeaderNavbar
        stats={stats}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenRoulette={() => setIsRouletteOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 w-full space-y-6">
        {/* TAB: FAVORITES */}
        {activeTab === "favorites" ? (
          <FavoritesView
            allLinks={links}
            onOpenDetails={(link) => setActiveLinkId(link.id)}
            onOpenQr={(link) => setActiveLinkId(link.id)}
            onExplore={() => setActiveTab("explore")}
            showToast={showToast}
          />
        ) : activeTab === "collections" ? (
          /* TAB: COLLECTIONS */
          <div className="pt-4">
            <CuratedCollections
              collections={collections}
              onSelectLink={(link) => setActiveLinkId(link.id)}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                setActiveTab("explore");
              }}
            />
          </div>
        ) : (
          /* TAB: EXPLORE / TRENDING */
          <>
            {/* Hero Section */}
            <HeroSection
              stats={stats}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              onOpenRoulette={() => setIsRouletteOpen(true)}
            />

            {/* Curated collections preview on Explore tab when not searching */}
            {!searchQuery && selectedCategory === "all" && activeTab === "explore" && (
              <CuratedCollections
                collections={collections.slice(0, 2)}
                onSelectLink={(link) => setActiveLinkId(link.id)}
                onSelectCategory={(catId) => setSelectedCategory(catId)}
              />
            )}

            {/* Filter & Sorting Pill Bar */}
            <FilterBar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              totalResults={totalCount}
            />

            {/* Links Catalog Grid */}
            <section className="w-full px-3 sm:px-6">
              <div className="max-w-7xl mx-auto">
                {loading ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Carregando catálogo translúcido...</p>
                  </div>
                ) : links.length === 0 ? (
                  <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border-white/15 my-6">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300">
                      <FolderOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Nenhum canal encontrado</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Não encontramos canais com esses filtros. Tente buscar por outros termos ou
                      adicione um novo canal!
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                          setSelectedType("all");
                          setVerifiedOnly(false);
                        }}
                        className="px-4 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-200 hover:text-white"
                      >
                        Limpar Filtros
                      </button>
                      <button
                        onClick={() => setIsSubmitOpen(true)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                      >
                        Sugerir Canal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {links.map((link) => (
                      <TelegramCard
                        key={link.id}
                        link={link}
                        onOpenDetails={(l) => setActiveLinkId(l.id)}
                        onOpenQr={(l) => setActiveLinkId(l.id)}
                        onLinkUpdated={handleLinkUpdated}
                        showToast={showToast}
                      />
                    ))}
                  </div>
                )}
                {!loading && links.length > 0 && hasMore && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-5 py-2.5 rounded-2xl glass-pill text-xs font-semibold text-slate-200 hover:text-white disabled:opacity-60"
                    >
                      {loadingMore ? "Carregando..." : "Carregar mais links"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Floating Glass Back-to-Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 md:bottom-6 left-6 z-30 p-3 rounded-2xl glass-panel text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 shadow-xl transition-all active:scale-95 hidden sm:flex cursor-pointer"
        title="Voltar ao Topo"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Footer */}
      <footer className="mt-16 w-full px-3 sm:px-6">
        <div className="max-w-7xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 border-white/10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Send className="w-4 h-4 -rotate-12" />
            </div>
            <span className="font-extrabold text-base bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Telegram Hub Progressive Web App
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            O diretório mais completo de canais, robôs, grupos e stickers do Telegram com
            estética translúcida de vidro líquido. Feito para a comunidade.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 flex-wrap">
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Enviar Canal
            </button>
            <span>•</span>
            <button
              onClick={() => setIsRouletteOpen(true)}
              className="hover:text-white cursor-pointer"
            >
              Roleta de Links
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab("favorites")}
              className="hover:text-white cursor-pointer"
            >
              Meus Favoritos
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-white cursor-pointer"
            >
              Moderação
            </button>
          </div>

          <p className="text-[11px] text-slate-400 pt-2">
            © {new Date().getFullYear()} Telegram Hub. Todas as marcas e marcas registradas pertencem aos seus respectivos proprietários.
          </p>
        </div>
      </footer>

      {/* Mobile Floating Glass Dock */}
      <GlassDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenRoulette={() => setIsRouletteOpen(true)}
      />

      {/* Modals */}
      {activeLinkId !== null && (
        <LinkDetailModal
          linkId={activeLinkId}
          onClose={() => setActiveLinkId(null)}
          onLinkUpdated={handleLinkUpdated}
          showToast={showToast}
        />
      )}

      {isSubmitOpen && (
        <SubmitLinkModal
          categories={categories}
          onClose={() => setIsSubmitOpen(false)}
          onLinkAdded={handleLinkAdded}
          showToast={showToast}
        />
      )}

      {isRouletteOpen && (
        <RandomRouletteModal
          links={links}
          onClose={() => setIsRouletteOpen(false)}
          onOpenDetails={(link) => setActiveLinkId(link.id)}
        />
      )}

      {isAdminOpen && (
        <AdminModerationModal
          onClose={() => setIsAdminOpen(false)}
          onRefreshData={() => {
            // Refresh every public surface after moderation. Collections keep
            // their own in-memory list, so refreshing only the catalog would
            // leave a rejected link visible in the collections tab.
            void Promise.all([
              fetchLinks(),
              fetchCollections(),
              fetchCategories(),
              fetchStats(),
            ]);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

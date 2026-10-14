"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    // This mirrors the browser's standalone display mode into component state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check dismissed in session
    if (sessionStorage.getItem("pwa_dismissed") === "true") {
      setDismissed(true);
    }

    // Android/Desktop prompt capture
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa_dismissed", "true");
  };

  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <>
      {/* Floating Glass PWA Install Banner */}
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-[380px] z-40 animate-in fade-in slide-in-from-bottom duration-500">
        <div className="glass-panel rounded-2xl p-4 border-cyan-500/30 bg-slate-900/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/30 text-cyan-300 shrink-0 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-semibold text-white tracking-wide">
                  Instale o App TeleGlass
                </h4>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300/80 mt-0.5 line-clamp-2">
                Acesse mais rápido, offline e com visual translúcido de vidro na sua tela inicial.
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar App</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Depois
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-6 relative border border-white/20">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Instalar no seu iPhone / iPad</h3>
              <p className="text-xs text-slate-300 mt-1">
                Adicione o TeleGlass à tela de início em apenas 2 passos simples:
              </p>
            </div>

            <div className="space-y-3.5 text-left">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">1. Toque em Compartilhar</p>
                  <p className="text-[11px] text-slate-400">
                    No Safari, toque no ícone de compartilhamento na barra inferior do navegador.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">2. Adicionar à Tela de Início</p>
                  <p className="text-[11px] text-slate-400">
                    Role as opções para baixo e selecione &quot;Adicionar à Tela de Início&quot;.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25"
            >
              <CheckCircle2 className="w-4 h-4" /> Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine
  );

  useEffect(() => {
    const registerServiceWorker = () => {
      if (!("serviceWorker" in navigator)) return;
      void navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Telegram Hub PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("Telegram Hub SW registration failed:", err);
        });
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker, { once: true });
    }

    // Network status listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("load", registerServiceWorker);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-bounce">
      <div className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between text-amber-200 border-amber-500/30 bg-amber-950/80 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-100">Modo Offline Ativo</p>
            <p className="text-[11px] text-amber-300/80">Exibindo dados em cache.</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 transition-colors"
          title="Tentar reconectar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

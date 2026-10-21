"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

export function ApkInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = sessionStorage.getItem("apk_dismissed") === "true";
    setVisible(isAndroid && !isStandalone && !dismissed);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("apk_dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-40 md:bottom-28 right-4 left-4 md:left-auto md:w-[380px] z-40 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="glass-panel rounded-2xl p-4 border-violet-400/30 bg-slate-900/90 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/25 to-fuchsia-600/30 border border-violet-400/30 text-violet-200 shrink-0 shadow-inner">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-white tracking-wide">
                Instale o App Telegram Hub Apk
              </h4>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-violet-500/20 text-violet-200 border border-violet-400/30">
                APK
              </span>
            </div>
            <p className="text-[11px] text-slate-300/80 mt-0.5 line-clamp-2">
              Baixe a versão Android diretamente e tenha acesso rápido ao Telegram Hub.
            </p>

            <div className="flex items-center gap-2 mt-2.5">
              <a
                href="/downloads/telegram-hub.apk"
                download="telegram-hub.apk"
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all flex items-center gap-1.5 shadow-lg shadow-violet-500/25 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar App</span>
              </a>
              <button
                onClick={dismiss}
                className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Depois
              </button>
            </div>
          </div>

          <button
            onClick={dismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
            aria-label="Fechar instalação do APK"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

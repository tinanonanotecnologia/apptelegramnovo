"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
      <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs font-semibold text-white border-cyan-400/40 bg-slate-900/90 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span>{message}</span>
      </div>
    </div>
  );
}

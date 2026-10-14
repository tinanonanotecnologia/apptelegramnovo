import confetti from "canvas-confetti";
import {
  Cpu,
  Tag,
  Bot,
  GraduationCap,
  Film,
  Coins,
  Briefcase,
  Smile,
  Sparkles,
  Newspaper,
  Gamepad2,
  Palette,
  FolderKanban,
  Send,
  Users,
  MessageSquare,
  Sticker,
} from "lucide-react";
import React from "react";
import { LinkType } from "./types";

export function formatMemberCount(count: number = 0): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
}

export function getTypeBadge(type: LinkType) {
  switch (type) {
    case "channel":
      return {
        label: "Canal",
        icon: Send,
        bg: "bg-cyan-500/15 border-cyan-400/30 text-cyan-300",
      };
    case "group":
    case "supergroup":
      return {
        label: "Grupo",
        icon: Users,
        bg: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
      };
    case "bot":
      return {
        label: "Bot",
        icon: Bot,
        bg: "bg-purple-500/15 border-purple-400/30 text-purple-300",
      };
    case "sticker_pack":
      return {
        label: "Stickers",
        icon: Sticker,
        bg: "bg-pink-500/15 border-pink-400/30 text-pink-300",
      };
    default:
      return {
        label: "Comunidade",
        icon: MessageSquare,
        bg: "bg-blue-500/15 border-blue-400/30 text-blue-300",
      };
  }
}

export function getCategoryIconComponent(iconName: string): React.ElementType {
  switch (iconName) {
    case "Cpu":
      return Cpu;
    case "Tag":
      return Tag;
    case "Bot":
      return Bot;
    case "GraduationCap":
      return GraduationCap;
    case "Film":
      return Film;
    case "Coins":
      return Coins;
    case "Briefcase":
      return Briefcase;
    case "Smile":
      return Smile;
    case "Sparkles":
      return Sparkles;
    case "Newspaper":
      return Newspaper;
    case "Gamepad2":
      return Gamepad2;
    case "Palette":
      return Palette;
    default:
      return FolderKanban;
  }
}

export function getDirectTelegramUrl(handle: string, url: string): { deepLink: string; webUrl: string } {
  let cleanDomain = handle.replace(/^@/, "").replace(/^\+/, "").trim();
  let webUrl = url;

  if (!webUrl) {
    webUrl = `https://t.me/${cleanDomain}`;
  }

  let deepLink = `tg://resolve?domain=${cleanDomain}`;
  if (handle.startsWith("+") || url.includes("/+")) {
    deepLink = url;
  }

  return { deepLink, webUrl };
}

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#38bdf8", "#818cf8", "#c084fc", "#34d399", "#f43f5e"],
      disableForReducedMotion: true,
    });
  } catch (e) {
    // Ignore if blocked
  }
}

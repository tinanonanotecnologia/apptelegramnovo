"use client";

import { useEffect } from "react";

const PRESENCE_STORAGE_KEY = "telegram_hub_presence_id";
const HEARTBEAT_INTERVAL_MS = 30_000;

function createFallbackVisitorId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function getVisitorId() {
  try {
    const saved = window.localStorage.getItem(PRESENCE_STORAGE_KEY);
    if (saved) return saved;

    const visitorId = window.crypto?.randomUUID?.() || createFallbackVisitorId();
    window.localStorage.setItem(PRESENCE_STORAGE_KEY, visitorId);
    return visitorId;
  } catch {
    return createFallbackVisitorId();
  }
}

export function PresenceHeartbeat() {
  useEffect(() => {
    const visitorId = getVisitorId();

    const sendHeartbeat = () => {
      if (document.visibilityState === "hidden") return;

      void fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ visitorId, path: window.location.pathname }),
        keepalive: true,
      }).catch(() => {
        // Presence is best-effort and must never interrupt the public catalog.
      });
    };

    sendHeartbeat();
    const intervalId = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") sendHeartbeat();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

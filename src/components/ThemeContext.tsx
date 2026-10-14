"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type GlassTheme = "nebula" | "frost" | "emerald" | "sunset" | "obsidian";

interface ThemeContextType {
  theme: GlassTheme;
  setTheme: (theme: GlassTheme) => void;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<GlassTheme>("nebula");
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    // Load saved theme
    try {
      const savedTheme = localStorage.getItem("teleglass_theme") as GlassTheme;
      if (savedTheme && ["nebula", "frost", "emerald", "sunset", "obsidian"].includes(savedTheme)) {
        // Hydrate the persisted theme once browser storage is available.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThemeState(savedTheme);
        document.documentElement.setAttribute("data-glass-theme", savedTheme);
      } else {
        document.documentElement.setAttribute("data-glass-theme", "nebula");
      }

      // Load favorites
      const savedFavs = localStorage.getItem("teleglass_favs");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
  }, []);

  const setTheme = (newTheme: GlassTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("teleglass_theme", newTheme);
      document.documentElement.setAttribute("data-glass-theme", newTheme);
    } catch (e) {
      console.warn("Could not save theme:", e);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem("teleglass_favs", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save favs:", e);
      }
      return next;
    });
  };

  const isFavorite = (id: number) => favorites.includes(id);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, favorites, toggleFavorite, isFavorite }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useGlassTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useGlassTheme must be used within a ThemeProvider");
  }
  return context;
}

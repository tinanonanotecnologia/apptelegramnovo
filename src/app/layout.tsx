import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import { GlassBackground } from "@/components/GlassBackground";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

export const metadata: Metadata = {
  title: "TeleGlass | Agregador Glass de Canais, Grupos e Bots do Telegram (PWA)",
  description:
    "Descubra os melhores canais, grupos, bots, ferramentas e figurinhas do Telegram no Brasil e no mundo com visual translúcido de vidro.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TeleGlass",
  },
  applicationName: "TeleGlass",
  keywords: [
    "telegram",
    "canais telegram",
    "grupos telegram",
    "bots telegram",
    "figurinhas telegram",
    "agregador telegram",
    "pwa",
    "links telegram",
    "teleglass",
  ],
  openGraph: {
    title: "TeleGlass - Agregador de Links do Telegram",
    description: "Encontre os melhores canais, grupos, bots e figurinhas do Telegram.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1528",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <ThemeProvider>
          <GlassBackground />
          <ServiceWorkerRegister />
          {children}
          <PWAInstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}

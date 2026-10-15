import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import { GlassBackground } from "@/components/GlassBackground";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

export const metadata: Metadata = {
  title: "Telegram Hub | Descubra comunidades do Telegram",
  description:
    "O ponto de encontro das comunidades do Telegram: canais, grupos, bots, cursos, promoções e muito mais em um hub visual Nebula Glass.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Telegram Hub",
  },
  applicationName: "Telegram Hub",
  keywords: [
    "telegram",
    "canais telegram",
    "grupos telegram",
    "bots telegram",
    "figurinhas telegram",
    "agregador telegram",
    "pwa",
    "links telegram",
    "telegram hub",
  ],
  openGraph: {
    title: "Telegram Hub - Comunidades do Telegram",
    description: "O ponto de encontro das comunidades do Telegram.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#070B16",
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

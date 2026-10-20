"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft, ExternalLink, QrCode, Share2, ShieldCheck, Star } from "lucide-react";
import type { TelegramLinkItem } from "@/lib/types";

export default function PublicLinkPage() {
  const params = useParams<{ id: string }>();
  const [link, setLink] = useState<(TelegramLinkItem & { category?: { name?: string } | null }) | null>(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/links/${params.id}`, { cache: "no-store" })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok || !data.success) throw new Error(data.error || "Link não encontrado.");
        setLink(data.data);
        return QRCode.toDataURL(data.data.url, { width: 320, margin: 2 });
      })
      .then(setQr)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Não foi possível carregar o link."));
  }, [params?.id]);

  if (error) return <main className="min-h-screen bg-[#070b16] p-6 text-center text-slate-300"><p className="mt-24">{error}</p></main>;
  if (!link) return <main className="min-h-screen bg-[#070b16] p-6 text-center text-slate-400"><p className="mt-24">Carregando comunidade...</p></main>;

  const share = () => navigator.share?.({ title: `${link.title} no Telegram Hub`, text: link.description, url: window.location.href });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#070b16] via-[#0d162d] to-[#060914] px-4 py-6 text-white">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => history.back()} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <article className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-200">
            <span className="rounded-full bg-cyan-400/15 px-3 py-1">{link.type}</span>
            {link.isVerified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1"><ShieldCheck className="h-3.5 w-3.5" /> Verificado</span>}
            {link.category?.name && <span className="rounded-full bg-white/10 px-3 py-1">{link.category.name}</span>}
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight">{link.title}</h1>
          <p className="mt-1 font-mono text-cyan-300">{link.handle}</p>
          <p className="mt-5 leading-7 text-slate-300">{link.description}</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-amber-300"><Star className="h-4 w-4 fill-current" /> {link.ratingAvg} ({link.ratingCount} avaliações)</div>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950"><ExternalLink className="h-4 w-4" /> Abrir no Telegram</a>
            <button onClick={() => void share()} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold"><Share2 className="h-4 w-4" /> Compartilhar</button>
          </div>
          {qr && <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white p-4"><img src={qr} alt="QR Code do link do Telegram" className="h-48 w-48" /><span className="text-xs text-slate-600">Escaneie para abrir no Telegram</span></div>}
          <div className="mt-8 inline-flex items-center gap-2 text-xs text-slate-500"><QrCode className="h-4 w-4" /> Página pública do Telegram Hub</div>
        </article>
      </div>
    </main>
  );
}

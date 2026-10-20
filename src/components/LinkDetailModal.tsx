"use client";

import React, { useEffect, useState } from "react";
import { TelegramLinkItem, ReviewItem } from "@/lib/types";
import {
  X,
  Send,
  Users,
  Star,
  CheckCircle2,
  Heart,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  QrCode,
  Download,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame,
} from "lucide-react";
import QRCode from "qrcode";
import {
  formatMemberCount,
  getTypeBadge,
  triggerConfetti,
  getDirectTelegramUrl,
} from "@/lib/utils";
import { useGlassTheme } from "./ThemeContext";

interface LinkDetailModalProps {
  linkId: number | null;
  onClose: () => void;
  onLinkUpdated?: (updated: TelegramLinkItem) => void;
  showToast?: (msg: string) => void;
}

export function LinkDetailModal({
  linkId,
  onClose,
  onLinkUpdated,
  showToast,
}: LinkDetailModalProps) {
  const { isFavorite, toggleFavorite } = useGlassTheme();
  const [linkData, setLinkData] = useState<TelegramLinkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("broken_link");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Review Form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!linkId) return;

    // The detail request owns the loading state for this modal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/links/${linkId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setLinkData(data.data);
          // Generate QR code
          QRCode.toDataURL(data.data.url, {
            width: 320,
            margin: 2,
            color: {
              dark: "#0b132b",
              light: "#f0f9ff",
            },
          }).then(setQrDataUrl);
        }
      })
      .catch((err) => console.error("Error fetching detail:", err))
      .finally(() => setLoading(false));
  }, [linkId]);

  if (!linkId) return null;

  const favorited = linkData ? isFavorite(linkData.id) : false;

  const handleCopyLink = async () => {
    if (!linkData) return;
    try {
      await navigator.clipboard.writeText(linkData.url);
      setCopied(true);
      triggerConfetti();
      if (showToast) showToast(`Link copiado: ${linkData.url}`);
      setTimeout(() => setCopied(false), 2000);
      fetch(`/api/links/${linkData.id}/click`, { method: "POST" }).catch(() => {});
    } catch (err) {
      console.warn("Copy error", err);
    }
  };

  const handleOpenTelegram = () => {
    if (!linkData) return;
    fetch(`/api/links/${linkData.id}/click`, { method: "POST" }).catch(() => {});
    window.open(linkData.url, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    if (!linkData) return;
    const shareData = {
      title: `${linkData.title} no Telegram Hub`,
      text: `Confira este canal do Telegram: ${linkData.title} (${linkData.handle})`,
      url: `${window.location.origin}/link/${linkData.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkData || !reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/links/${linkData.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: reviewName.trim() || "Membro da Comunidade",
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        triggerConfetti();
        if (showToast) showToast("Avaliação publicada com sucesso!");
        // Update local reviews list
        const updatedReviews = [resData.data, ...(linkData.reviews || [])];
        const updatedLink = {
          ...linkData,
          reviews: updatedReviews,
          ratingAvg: resData.newAvg,
          ratingCount: resData.totalRatings,
        };
        setLinkData(updatedLink);
        if (onLinkUpdated) onLinkUpdated(updatedLink);
        setReviewComment("");
        setReviewName("");
      } else {
        if (showToast) showToast("Erro ao enviar avaliação.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkData) return;

    setReportSubmitting(true);
    try {
      const res = await fetch(`/api/links/${linkData.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        if (showToast) showToast("Denúncia enviada para os moderadores.");
        setShowReportForm(false);
        setReportDetails("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportSubmitting(false);
    }
  };

  const typeBadge = linkData ? getTypeBadge(linkData.type) : null;
  const TypeIcon = typeBadge ? typeBadge.icon : Send;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl overflow-y-auto">
      <div className="glass-modal max-w-2xl w-full rounded-3xl p-5 sm:p-7 relative border border-white/20 my-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-300">Carregando detalhes do canal...</p>
          </div>
        ) : !linkData ? (
          <div className="py-12 text-center text-slate-400">Canal não encontrado.</div>
        ) : (
          <div className="space-y-6">
            {/* Header: Title, Handle, Badges */}
            <div className="space-y-2.5 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                {typeBadge && (
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${typeBadge.bg}`}
                  >
                    <TypeIcon className="w-3 h-3" />
                    <span>{typeBadge.label}</span>
                  </span>
                )}

                {linkData.isVerified && (
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verificado
                  </span>
                )}

                {linkData.isFeatured && (
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Destaque
                  </span>
                )}

                <span className="px-2.5 py-1 rounded-xl text-[10px] font-medium bg-white/10 text-slate-300 border border-white/15">
                  {linkData.language.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{linkData.title}</h2>
              </div>

              <p className="text-sm font-semibold text-cyan-300 font-mono">{linkData.handle}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Membros</p>
                <p className="text-sm sm:text-base font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-cyan-300" />
                  {formatMemberCount(linkData.memberCount)}
                </p>
              </div>

              <div className="text-center border-x border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Avaliação</p>
                <p className="text-sm sm:text-base font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {linkData.ratingAvg} ({linkData.ratingCount})
                </p>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Acessos</p>
                <p className="text-sm sm:text-base font-bold text-cyan-200 mt-0.5">
                  {linkData.clicksCount || 0}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-sm text-slate-200 leading-relaxed">{linkData.description}</p>
              {linkData.longDescription && (
                <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  {linkData.longDescription}
                </p>
              )}
            </div>

            {/* Tags */}
            {linkData.tags && linkData.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {linkData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-xs bg-white/[0.06] text-slate-300 border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Bar (Direct Open, Copy, QR, Fav, Share) */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={handleOpenTelegram}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4 -rotate-12" />
                <span>Abrir no Telegram</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-3 rounded-2xl glass-pill text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Copiar Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">Copiar</span>
              </button>

              <button
                onClick={() => setShowQrModal(!showQrModal)}
                className="p-3 rounded-2xl glass-pill text-slate-200 hover:text-white transition-colors cursor-pointer"
                title="Ver QR Code"
              >
                <QrCode className="w-4 h-4 text-cyan-300" />
              </button>

              <button
                onClick={() => toggleFavorite(linkData.id)}
                className={`p-3 rounded-2xl transition-all cursor-pointer ${
                  favorited
                    ? "bg-rose-500/25 text-rose-300 border border-rose-400/40"
                    : "glass-pill text-slate-300 hover:text-rose-300"
                }`}
                title="Favoritar"
              >
                <Heart className={`w-4 h-4 ${favorited ? "fill-rose-400" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-2xl glass-pill text-slate-200 hover:text-white transition-colors cursor-pointer"
                title="Compartilhar"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code Section (Collapsible) */}
            {showQrModal && qrDataUrl && (
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-cyan-400/30 text-center space-y-3 animate-in fade-in duration-200">
                <p className="text-xs font-bold text-white">Escaneie para entrar no celular</p>
                <div className="bg-white p-3 rounded-2xl inline-block shadow-2xl">
                  <img src={qrDataUrl} alt="QR Code Telegram" className="w-44 h-44 mx-auto" />
                </div>
                <div>
                  <a
                    href={qrDataUrl}
                    download={`qrcode-${linkData.handle.replace("@", "")}.png`}
                    className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar imagem do QR Code
                  </a>
                </div>
              </div>
            )}

            {/* User Reviews & Rating Section */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-300" />
                  <h3 className="text-sm font-bold text-white">
                    Avaliações ({linkData.reviews?.length || 0})
                  </h3>
                </div>

                <button
                  onClick={() => setShowReportForm(!showReportForm)}
                  className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Denunciar link</span>
                </button>
              </div>

              {/* Report form dropdown */}
              {showReportForm && (
                <form
                  onSubmit={handleSubmitReport}
                  className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-3"
                >
                  <p className="text-xs font-bold text-amber-200">Reportar problema com este link</p>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                  >
                    <option value="broken_link" className="bg-slate-900">Link quebrado ou expirado</option>
                    <option value="spam" className="bg-slate-900">Spam ou golpe (Scam)</option>
                    <option value="nsfw" className="bg-slate-900">Conteúdo impróprio não categorizado</option>
                    <option value="other" className="bg-slate-900">Outro motivo</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Detalhes adicionais (opcional)"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={reportSubmitting}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      {reportSubmitting ? "Enviando..." : "Enviar Denúncia"}
                    </button>
                  </div>
                </form>
              )}

              {/* Add review form */}
              <form
                onSubmit={handleSubmitReview}
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Seu nome (opcional)"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="flex-1 min-w-[150px] p-2 rounded-xl glass-input text-xs text-white placeholder-slate-400"
                  />

                  {/* Star selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= reviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="O que você achou deste canal/bot?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="flex-1 p-2 rounded-xl glass-input text-xs text-white placeholder-slate-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !reviewComment.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 border border-cyan-400/40 text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? "Enviando..." : "Avaliar"}
                  </button>
                </div>
              </form>

              {/* Existing Reviews List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {linkData.reviews && linkData.reviews.length > 0 ? (
                  linkData.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{rev.authorName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { CategoryItem, TelegramLinkItem, LinkType } from "@/lib/types";
import {
  X,
  Send,
  Plus,
  Sparkles,
  Bot,
  Users,
  Sticker,
  CheckCircle2,
  Globe,
  Tag,
  Hash,
} from "lucide-react";
import { getTypeBadge, triggerConfetti } from "@/lib/utils";

interface SubmitLinkModalProps {
  categories: CategoryItem[];
  onClose: () => void;
  onLinkAdded: (newLink: TelegramLinkItem) => void;
  showToast?: (msg: string) => void;
}

export function SubmitLinkModal({
  categories,
  onClose,
  onLinkAdded,
  showToast,
}: SubmitLinkModalProps) {
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "tech-ia");
  const [type, setType] = useState<LinkType>("channel");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("pt");
  const [memberCount, setMemberCount] = useState("500");
  const [submittedBy, setSubmittedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle URL auto-fill
  const handleUrlChange = (value: string) => {
    setUrl(value);
    const match = value.match(/t\.me\/([a-zA-Z0-9_+]+)/i);
    if (match && match[1] && !handle) {
      setHandle(match[1].startsWith("+") ? match[1] : `@${match[1]}`);
    }
  };

  // Handle Arroba change
  const handleArrobaChange = (value: string) => {
    let clean = value.trim();
    if (clean && !clean.startsWith("@") && !clean.startsWith("+") && !clean.startsWith("http")) {
      clean = `@${clean}`;
    }
    setHandle(clean);
    if (clean.startsWith("@") && !url) {
      setUrl(`https://t.me/${clean.replace("@", "")}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || !description.trim() || !categoryId) {
      setErrorMsg("Preencha título, descrição e selecione uma categoria.");
      return;
    }

    if (!handle && !url) {
      setErrorMsg("Informe o link do Telegram ou o @arroba.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          handle,
          url,
          description,
          type,
          categoryId,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          language,
          memberCount: Number(memberCount) || 100,
          submittedBy: submittedBy.trim() || "Comunidade",
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        triggerConfetti();
        if (showToast) showToast("Canal/Grupo adicionado com sucesso ao agregador!");
        onLinkAdded(data.data);
        onClose();
      } else {
        setErrorMsg(data.error || "Erro ao adicionar o link.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewBadge = getTypeBadge(type);
  const TypeIcon = previewBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl overflow-y-auto">
      <div className="glass-modal max-w-xl w-full rounded-3xl p-5 sm:p-7 relative border border-white/20 my-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-left space-y-1 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Plus className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-white">Sugerir / Enviar Link</h2>
          </div>
          <p className="text-xs text-slate-300">
            Cadastre seu canal, grupo, bot ou pacote de figurinhas para milhares de pessoas descobrirem.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Link Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tipo do Link
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "channel", label: "Canal", icon: Send },
                { id: "group", label: "Grupo", icon: Users },
                { id: "bot", label: "Bot", icon: Bot },
                { id: "sticker_pack", label: "Stickers", icon: Sticker },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as LinkType)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold"
                        : "glass-pill text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Handle row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Canal / Grupo *
              </label>
              <input
                type="text"
                placeholder="Ex: Python Brasil"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Arroba / Handle (@nome)
              </label>
              <input
                type="text"
                placeholder="@pythonbr"
                value={handle}
                onChange={(e) => handleArrobaChange(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {/* Telegram URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Link do Telegram (t.me/...) *
            </label>
            <input
              type="text"
              placeholder="https://t.me/pythonbr ou https://t.me/+joinchat..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descrição Curta *
            </label>
            <textarea
              rows={2}
              placeholder="Resuma o propósito do canal em poucas frases para os visitantes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
            />
          </div>

          {/* Category & Language row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Idioma</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
              >
                <option value="pt" className="bg-slate-900 text-white">🇧🇷 Português (Brasil)</option>
                <option value="global" className="bg-slate-900 text-white">🌐 Global / Internacional</option>
                <option value="en" className="bg-slate-900 text-white">🇺🇸 Inglês</option>
                <option value="es" className="bg-slate-900 text-white">🇪🇸 Espanhol</option>
              </select>
            </div>
          </div>

          {/* Tags & Estimated Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="tech, dev, python, cursos"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Qtd. Estimada de Membros
              </label>
              <input
                type="number"
                min="10"
                placeholder="Ex: 2500"
                value={memberCount}
                onChange={(e) => setMemberCount(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {/* Card Live Preview Mini Box */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pré-visualização do Card Glass
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  {title || "Nome do seu Canal"}
                </p>
                <p className="text-[11px] text-cyan-300 font-mono">
                  {handle || "@seu_canal"}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border ${previewBadge.bg}`}
              >
                <TypeIcon className="w-2.5 h-2.5" />
                {previewBadge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              {description || "Sua descrição aparecerá aqui..."}
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? "Cadastrando..." : "Publicar Link no Agregador"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

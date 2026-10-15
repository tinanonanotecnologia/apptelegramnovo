"use client";

import React, { useState } from "react";
import { LinkType, TelegramLinkItem, CategoryItem } from "@/lib/types";
import { LoaderCircle, Save, X } from "lucide-react";

type EditableLink = Pick<
  TelegramLinkItem,
  | "title"
  | "handle"
  | "url"
  | "description"
  | "longDescription"
  | "categoryId"
  | "type"
  | "language"
  | "tags"
  | "memberCount"
  | "status"
  | "isFeatured"
  | "isVerified"
  | "isNsfw"
  | "submittedBy"
>;

interface ModerationLinkEditModalProps {
  link: TelegramLinkItem;
  categories: CategoryItem[];
  submitting: boolean;
  onClose: () => void;
  onSave: (updates: Partial<EditableLink>) => Promise<boolean>;
}

const inputClass = "w-full rounded-xl glass-input px-3 py-2.5 text-xs text-white";

export function ModerationLinkEditModal({
  link,
  categories,
  submitting,
  onClose,
  onSave,
}: ModerationLinkEditModalProps) {
  const [form, setForm] = useState<EditableLink>({
    title: link.title,
    handle: link.handle,
    url: link.url,
    description: link.description,
    longDescription: link.longDescription || "",
    categoryId: link.categoryId,
    type: link.type,
    language: link.language,
    tags: link.tags || [],
    memberCount: link.memberCount,
    status: link.status,
    isFeatured: link.isFeatured,
    isVerified: link.isVerified,
    isNsfw: link.isNsfw,
    submittedBy: link.submittedBy || "Comunidade",
  });
  const [tagsText, setTagsText] = useState((link.tags || []).join(", "));
  const [error, setError] = useState("");

  const setField = <K extends keyof EditableLink>(field: K, value: EditableLink[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.description.trim() || !form.categoryId) {
      setError("Título, descrição e categoria são obrigatórios.");
      return;
    }
    if (!form.url.trim() && !form.handle.trim()) {
      setError("Informe o link do Telegram ou o @arroba.");
      return;
    }
    const ok = await onSave({
      ...form,
      title: form.title.trim(),
      handle: form.handle.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
      longDescription: form.longDescription?.trim() || null,
      tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
      submittedBy: form.submittedBy?.trim() || "Comunidade",
      memberCount: Number(form.memberCount) || 0,
    });
    if (!ok) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3 backdrop-blur-xl sm:p-4">
      <div className="glass-modal max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 p-5 shadow-2xl sm:p-7">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Editar link enviado</h2>
            <p className="mt-1 text-xs text-slate-400">Ajuste as informações antes de publicar na comunidade.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Fechar edição">
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && <div role="alert" className="mb-4 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-300">Título *<input className={inputClass} maxLength={160} value={form.title} onChange={(e) => setField("title", e.target.value)} /></label>
            <label className="text-xs text-slate-300">Tipo *<select className={`${inputClass} bg-slate-900`} value={form.type} onChange={(e) => setField("type", e.target.value as LinkType)}><option value="channel">Canal</option><option value="group">Grupo</option><option value="bot">Bot</option><option value="sticker_pack">Stickers</option><option value="supergroup">Supergrupo</option></select></label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-300">Handle<input className={inputClass} value={form.handle} onChange={(e) => setField("handle", e.target.value)} placeholder="@nome ou +convite" /></label>
            <label className="text-xs text-slate-300">URL do Telegram *<input className={inputClass} value={form.url} onChange={(e) => setField("url", e.target.value)} placeholder="https://t.me/nome" /></label>
          </div>
          <label className="block text-xs text-slate-300">Descrição curta *<textarea className={inputClass} rows={2} maxLength={2000} value={form.description} onChange={(e) => setField("description", e.target.value)} /></label>
          <label className="block text-xs text-slate-300">Descrição completa<textarea className={inputClass} rows={4} maxLength={10000} value={form.longDescription || ""} onChange={(e) => setField("longDescription", e.target.value)} /></label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-xs text-slate-300">Categoria *<select className={`${inputClass} bg-slate-900`} value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="text-xs text-slate-300">Idioma<select className={`${inputClass} bg-slate-900`} value={form.language} onChange={(e) => setField("language", e.target.value)}><option value="pt">Português</option><option value="en">Inglês</option><option value="es">Espanhol</option><option value="global">Global</option></select></label>
            <label className="text-xs text-slate-300">Membros<input className={inputClass} type="number" min={0} max={2000000000} value={form.memberCount} onChange={(e) => setField("memberCount", Number(e.target.value))} /></label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-300">Tags (separadas por vírgula)<input className={inputClass} value={tagsText} onChange={(e) => setTagsText(e.target.value)} /></label>
            <label className="text-xs text-slate-300">Enviado por<input className={inputClass} maxLength={100} value={form.submittedBy || ""} onChange={(e) => setField("submittedBy", e.target.value)} /></label>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-[11px] text-slate-200"><input type="checkbox" checked={form.isVerified} onChange={(e) => setField("isVerified", e.target.checked)} /> Verificado</label>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-[11px] text-slate-200"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)} /> Destaque</label>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-[11px] text-slate-200"><input type="checkbox" checked={form.isNsfw} onChange={(e) => setField("isNsfw", e.target.checked)} /> NSFW</label>
            <label className="text-xs text-slate-300">Status<select className={`${inputClass} bg-slate-900`} value={form.status} onChange={(e) => setField("status", e.target.value as EditableLink["status"])}><option value="pending">Pendente</option><option value="approved">Aprovado</option><option value="rejected">Recusado</option></select></label>
          </div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white">Cancelar</button><button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50">{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}<span>{submitting ? "Salvando..." : "Salvar alterações"}</span></button></div>
        </form>
      </div>
    </div>
  );
}

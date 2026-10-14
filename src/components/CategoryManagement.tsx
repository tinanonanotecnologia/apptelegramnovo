"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FolderTree, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  gradient: string;
  order: number;
  linksCount?: number;
};

type CategoryForm = Omit<AdminCategory, "id" | "linksCount"> & { id?: string };

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  icon: "FolderKanban",
  description: "",
  gradient: "from-blue-500/20 to-cyan-500/20",
  order: 0,
};

export function CategoryManagement({ showToast }: { showToast?: (message: string) => void }) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/categories", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Não foi possível carregar categorias.");
      setCategories(data.data || []);
    } catch (loadError) {
      console.error("Error loading categories:", loadError);
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const updateForm = (key: keyof CategoryForm, value: string) => {
    setForm((previous) => ({ ...previous, [key]: key === "order" ? Number(value) || 0 : value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch(editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Não foi possível salvar a categoria.");
      showToast?.(editingId ? "Categoria atualizada." : "Categoria criada.");
      resetForm();
      await loadCategories();
    } catch (saveError) {
      console.error("Error saving category:", saveError);
      setError(saveError instanceof Error ? saveError.message : "Falha ao salvar categoria.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    if (category.linksCount && category.linksCount > 0) {
      showToast?.("Mova ou exclua os links desta categoria antes de excluí-la.");
      return;
    }
    if (!window.confirm(`Excluir a categoria “${category.name}”?`)) return;
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE", cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Não foi possível excluir a categoria.");
      showToast?.("Categoria excluída.");
      await loadCategories();
    } catch (deleteError) {
      console.error("Error deleting category:", deleteError);
      showToast?.(deleteError instanceof Error ? deleteError.message : "Falha ao excluir categoria.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white">Categorias do catálogo</h4>
            <p className="mt-1 text-[11px] text-slate-300">Crie uma categoria antes de cadastrar novos canais, grupos ou bots.</p>
          </div>
          {editingId && (
            <button onClick={resetForm} className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white" title="Cancelar edição">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Nome (ex.: Tecnologia e IA)" required className="glass-input rounded-xl px-3 py-2 text-xs" />
          <input value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} placeholder="Slug (ex.: tecnologia-ia)" required className="glass-input rounded-xl px-3 py-2 text-xs" />
          <input value={form.icon} onChange={(event) => updateForm("icon", event.target.value)} placeholder="Ícone Lucide (ex.: Cpu)" required className="glass-input rounded-xl px-3 py-2 text-xs" />
          <input type="number" min={0} value={form.order} onChange={(event) => updateForm("order", event.target.value)} placeholder="Ordem" className="glass-input rounded-xl px-3 py-2 text-xs" />
          <input value={form.gradient} onChange={(event) => updateForm("gradient", event.target.value)} placeholder="Gradiente Tailwind" className="glass-input rounded-xl px-3 py-2 text-xs sm:col-span-2" />
          <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Descrição da categoria" required rows={2} className="glass-input rounded-xl px-3 py-2 text-xs sm:col-span-2" />
          {error && <p className="text-xs text-rose-200 sm:col-span-2">{error}</p>}
          <button type="submit" disabled={saving} className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 sm:col-span-2">
            {editingId ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar categoria"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Carregando categorias...</div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 text-center text-xs text-amber-100">Nenhuma categoria cadastrada. Use o formulário acima para criar a primeira.</div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-200"><FolderTree className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">{category.name}</p>
                  <p className="truncate text-[11px] text-cyan-300">{category.slug} · {category.linksCount || 0} links</p>
                  <p className="truncate text-[11px] text-slate-400">{category.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => { setEditingId(category.id); setForm({ id: category.id, name: category.name, slug: category.slug, icon: category.icon, description: category.description, gradient: category.gradient, order: category.order }); }} className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-white/20"><Pencil className="h-3 w-3" />Editar</button>
                <button onClick={() => void handleDelete(category)} className="inline-flex items-center gap-1 rounded-xl bg-rose-500/20 px-2.5 py-1.5 text-[11px] font-semibold text-rose-200 hover:bg-rose-500/30"><Trash2 className="h-3 w-3" />Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

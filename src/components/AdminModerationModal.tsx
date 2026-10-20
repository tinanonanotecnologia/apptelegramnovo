"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryItem, TelegramLinkItem } from "@/lib/types";
import { CategoryManagement } from "./CategoryManagement";
import { ModerationLinkEditModal } from "./ModerationLinkEditModal";
import {
  X,
  ShieldCheck,
  Flame,
  CheckCircle2,
  RefreshCw,
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  LogOut,
  LoaderCircle,
  CircleAlert,
  Trash2,
  Activity,
  UsersRound,
  Search,
  Bell,
} from "lucide-react";

interface AdminModerationModalProps {
  onClose: () => void;
  onRefreshData: () => void;
  showToast?: (msg: string) => void;
}

type AuthStatus = "checking" | "unconfigured" | "login" | "authenticated";

type ReportItem = {
  id: number;
  linkId: number;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
};

type OnlineVisitor = {
  lastSeenAt: string;
  lastPath: string;
};

function formatPresenceTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function AdminModerationModal({
  onClose,
  onRefreshData,
  showToast,
}: AdminModerationModalProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"links" | "reports" | "categories" | "online" | "notifications">("links");
  const [links, setLinks] = useState<TelegramLinkItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [linkSearch, setLinkSearch] = useState("");
  const [deletingLinkId, setDeletingLinkId] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState<TelegramLinkItem | null>(null);
  const [savingLink, setSavingLink] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineVisitors, setOnlineVisitors] = useState<OnlineVisitor[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("Telegram Hub");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationUrl, setNotificationUrl] = useState("/");
  const [notificationSending, setNotificationSending] = useState(false);

  const filteredLinks = useMemo(() => {
    const query = linkSearch.trim().toLocaleLowerCase("pt-BR");
    if (!query) return links;

    return links.filter((link) =>
      [link.title, link.handle, link.description, link.url, link.type, link.status, link.categoryId]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(query))
    );
  }, [linkSearch, links]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha ao verificar a sessão.");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.configured) {
          setAuthStatus("unconfigured");
          setLoading(false);
          return;
        }
        setAuthStatus(data.authenticated ? "authenticated" : "login");
        setLoading(!data.authenticated);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthStatus("login");
        setLoginError("Não foi possível verificar a sessão. Tente novamente.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadData = useCallback(async () => {
    if (authStatus !== "authenticated") return;

    setLoading(true);
    try {
      const [response, categoriesResponse] = await Promise.all([
        fetch(`/api/admin/links?status=${encodeURIComponent(statusFilter)}`, { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const data = await response.json();
      const categoriesData = await categoriesResponse.json().catch(() => null);

      if (response.status === 401) {
        setAuthStatus("login");
        setLoginError("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Não foi possível carregar o painel.");
      }

      setLinks(data.data.links || []);
      setReports(data.data.reports || []);
      if (categoriesResponse.ok && categoriesData?.success) {
        setCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error("Error loading moderation data:", error);
      if (showToast) showToast("Não foi possível carregar os dados de moderação.");
    } finally {
      setLoading(false);
    }
  }, [authStatus, statusFilter, showToast]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      // Loading the moderation data updates several state fields after the session check.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadData();
    }
  }, [authStatus, loadData]);

  const loadPresence = useCallback(async () => {
    if (authStatus !== "authenticated") return;

    setOnlineLoading(true);
    setOnlineError("");
    try {
      const response = await fetch("/api/admin/presence", { cache: "no-store" });
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setAuthStatus("login");
        setLoginError("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Não foi possível carregar o monitoramento online.");
      }

      setOnlineCount(Number(data.data?.onlineCount || 0));
      setOnlineVisitors(Array.isArray(data.data?.visitors) ? data.data.visitors : []);
    } catch (error) {
      console.error("Error loading online presence:", error);
      setOnlineError(error instanceof Error ? error.message : "Falha ao carregar o monitoramento online.");
    } finally {
      setOnlineLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated" || activeTab !== "online") return;

    // Presence polling synchronizes this tab with the protected admin endpoint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPresence();
    const intervalId = window.setInterval(() => void loadPresence(), 30_000);
    return () => window.clearInterval(intervalId);
  }, [activeTab, authStatus, loadPresence]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.error || "Não foi possível entrar. Confira suas credenciais.");
        return;
      }

      setPassword("");
      setLoginError("");
      setAuthStatus("authenticated");
      if (showToast) showToast("Acesso ao painel de moderação autorizado.");
    } catch (error) {
      console.error("Admin login failed:", error);
      setLoginError("Falha de conexão. Tente novamente.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", cache: "no-store" });
    } finally {
      setAuthStatus("login");
      setLinks([]);
      setReports([]);
      setPassword("");
      setLinkSearch("");
      setLoginError("");
      setLoading(false);
      if (showToast) showToast("Você saiu do painel de moderação.");
    }
  };

  const handleSendNotification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotificationSending(true);
    try {
      const response = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ title: notificationTitle, body: notificationBody, url: notificationUrl }),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        setAuthStatus("login");
        setLoginError("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }
      if (!response.ok || !data?.success) throw new Error(data?.error || "Não foi possível enviar a notificação.");
      setNotificationBody("");
      if (showToast) showToast(`Notificação enviada para ${data.sent} dispositivo(s).`);
    } catch (error) {
      console.error("Error sending notification:", error);
      if (showToast) showToast(error instanceof Error ? error.message : "Falha ao enviar a notificação.");
    } finally {
      setNotificationSending(false);
    }
  };

  const handleUpdateLink = async (id: number, updates: Partial<TelegramLinkItem>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (response.status === 401) {
        setAuthStatus("login");
        setLoginError("Sua sessão expirou. Entre novamente para continuar.");
        return false;
      }

      if (!response.ok || !data.success) {
        if (showToast) showToast(data.error || "Não foi possível atualizar o link.");
        return false;
      }

      if (showToast) showToast("Link atualizado com sucesso.");
      const updatedLink = data.data as TelegramLinkItem | undefined;
      setLinks((previous) => {
        // Keep the current status filter accurate after moderation. A link
        // moved to another status should leave a filtered list immediately.
        if (statusFilter !== "all" && updatedLink?.status !== statusFilter) {
          return previous.filter((link) => link.id !== id);
        }
        return previous.map((link) =>
          link.id === id ? { ...link, ...updates, ...(updatedLink || {}) } : link
        );
      });
      onRefreshData();
      return true;
    } catch (error) {
      console.error("Error updating moderation link:", error);
      if (showToast) showToast("Falha de conexão ao atualizar o link.");
      return false;
    }
  };

  const handleSaveEditedLink = async (id: number, updates: Partial<TelegramLinkItem>) => {
    setSavingLink(true);
    try {
      return await handleUpdateLink(id, updates);
    } finally {
      setSavingLink(false);
    }
  };

  const handleDeleteLink = async (link: TelegramLinkItem) => {
    const confirmed = window.confirm(
      `Excluir "${link.title}" permanentemente? Esta ação também remove avaliações e denúncias vinculadas.`
    );
    if (!confirmed) return;

    setDeletingLinkId(link.id);
    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setAuthStatus("login");
        setLoginError("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Não foi possível excluir o link.");
      }

      setLinks((previous) => previous.filter((item) => item.id !== link.id));
      onRefreshData();
      if (showToast) showToast("Link excluído permanentemente.");
    } catch (error) {
      console.error("Error deleting moderation link:", error);
      if (showToast) showToast(error instanceof Error ? error.message : "Falha ao excluir o link.");
    } finally {
      setDeletingLinkId(null);
    }
  };

  const handleUpdateReport = async (id: number, status: "pending" | "resolved") => {
    try {
      const response = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (response.status === 401) {
        setAuthStatus("login");
        setLoginError("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Não foi possível atualizar a denúncia.");
      }

      setReports((previous) =>
        previous.map((report) => (report.id === id ? { ...report, status } : report))
      );
      if (showToast) showToast(status === "resolved" ? "Denúncia marcada como resolvida." : "Denúncia reaberta.");
    } catch (error) {
      console.error("Error updating report:", error);
      if (showToast) showToast("Não foi possível atualizar a denúncia.");
    }
  };

  if (authStatus !== "authenticated") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <div className="glass-modal w-full max-w-md rounded-3xl p-6 sm:p-8 relative border border-white/20 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar painel de moderação"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.18)]">
              {authStatus === "checking" ? (
                <LoaderCircle className="w-7 h-7 animate-spin" />
              ) : authStatus === "unconfigured" ? (
                <LockKeyhole className="w-7 h-7" />
              ) : (
                <ShieldCheck className="w-7 h-7" />
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">Painel de Moderação</h2>
            <p className="mt-1 text-xs text-slate-300">
              {authStatus === "checking"
                ? "Verificando sua sessão segura..."
                : authStatus === "unconfigured"
                  ? "Configure as credenciais do administrador no servidor para liberar o painel."
                  : "Entre com sua conta de administrador para continuar."}
            </p>
          </div>

          {authStatus === "checking" ? (
            <div className="py-8 text-center text-xs text-slate-400">Validando acesso...</div>
          ) : authStatus === "unconfigured" ? (
            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-left">
              <div className="flex items-start gap-2.5">
                <CircleAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" />
                <div className="text-xs text-amber-100/90 leading-relaxed">
                  <p className="font-semibold">Falta configurar o acesso no ambiente do servidor.</p>
                  <p className="mt-1 text-amber-100/70">
                    Defina <code className="text-amber-200">ADMIN_USERNAME</code>,{" "}
                    <code className="text-amber-200">ADMIN_PASSWORD</code> e{" "}
                    <code className="text-amber-200">ADMIN_SESSION_SECRET</code>. A chave de sessão deve ter pelo menos 32 caracteres.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {loginError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-3 text-xs text-rose-200"
                >
                  {loginError}
                </div>
              )}

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-300">Usuário</span>
                <span className="relative block">
                  <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={100}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Seu usuário de administrador"
                    className="glass-input w-full rounded-xl py-3 pl-10 pr-3 text-sm placeholder:text-slate-500"
                    disabled={loginSubmitting}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-300">Senha</span>
                <span className="relative block">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required
                    maxLength={256}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Sua senha"
                    className="glass-input w-full rounded-xl py-3 pl-10 pr-11 text-sm placeholder:text-slate-500"
                    disabled={loginSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                disabled={loginSubmitting || !username.trim() || !password}
                className="glass-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loginSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                )}
                <span>{loginSubmitting ? "Verificando..." : "Entrar na moderação"}</span>
              </button>
              <p className="text-center text-[11px] text-slate-500">
                A sessão é protegida e expira automaticamente após 8 horas.
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="glass-modal max-w-4xl w-full rounded-3xl p-5 sm:p-7 relative border border-white/20 my-auto shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Painel de Moderação</h3>
              <p className="text-xs text-slate-300">Gerencie canais, aprove cadastros e analise denúncias.</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              title="Sair da conta de moderação"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar painel de moderação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-3 border-b border-white/10 shrink-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("links")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "links"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Links ({links.length})
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "reports"
                  ? "bg-amber-500/25 text-amber-200 border border-amber-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Denúncias ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "categories"
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Categorias
            </button>
            <button
              onClick={() => setActiveTab("online")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "online"
                  ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Online
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "notifications"
                  ? "bg-violet-500/25 text-violet-200 border border-violet-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              Notificações
            </button>
          </div>

          {activeTab === "links" && (
            <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <label className="relative flex min-w-0 flex-1 sm:w-64 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={linkSearch}
                  onChange={(event) => setLinkSearch(event.target.value)}
                  placeholder="Pesquisar links..."
                  aria-label="Pesquisar links na moderação"
                  className="glass-input w-full min-w-0 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500"
                />
              </label>
              <div className="flex min-w-0 items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl glass-input bg-slate-900 p-2 text-xs text-white sm:flex-none"
                  aria-label="Filtrar links por status"
                >
                  <option value="all" className="bg-slate-900">Todos os Status</option>
                  <option value="approved" className="bg-slate-900">Aprovados</option>
                  <option value="pending" className="bg-slate-900">Pendentes</option>
                  <option value="rejected" className="bg-slate-900">Rejeitados</option>
                </select>
                <button
                  onClick={() => void loadData()}
                  className="shrink-0 rounded-xl glass-pill p-2 text-slate-300 hover:text-white"
                  title="Atualizar"
                  aria-label="Atualizar links"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Carregando dados...</div>
          ) : activeTab === "notifications" ? (
            <form onSubmit={handleSendNotification} className="mx-auto w-full max-w-xl space-y-4 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-violet-400/30 bg-violet-400/15 p-2 text-violet-200">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Enviar notificação</h4>
                  <p className="mt-1 text-xs text-violet-100/70">A mensagem será enviada aos dispositivos FCM ativos.</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-300">Título</span>
                <input value={notificationTitle} onChange={(event) => setNotificationTitle(event.target.value)} maxLength={100} required className="glass-input w-full rounded-xl px-3 py-3 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-300">Mensagem</span>
                <textarea value={notificationBody} onChange={(event) => setNotificationBody(event.target.value)} maxLength={500} required rows={4} placeholder="Ex.: Esta é uma notificação de teste." className="glass-input w-full rounded-xl px-3 py-3 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-300">Link ao tocar (opcional)</span>
                <input value={notificationUrl} onChange={(event) => setNotificationUrl(event.target.value)} maxLength={500} placeholder="/" className="glass-input w-full rounded-xl px-3 py-3 text-sm" />
              </label>
              <button type="submit" disabled={notificationSending || !notificationBody.trim()} className="glass-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                {notificationSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4 text-violet-300" />}
                {notificationSending ? "Enviando..." : "Enviar notificação"}
              </button>
            </form>
          ) : activeTab === "categories" ? (
            <CategoryManagement showToast={showToast} />
          ) : activeTab === "online" ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/15 p-2 text-emerald-200">
                      <UsersRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200/80">
                        Visitantes ativos
                      </p>
                      <p className="mt-1 text-3xl font-bold text-white">{onlineCount}</p>
                      <p className="mt-1 text-xs text-emerald-100/70">Sessões vistas nos últimos 5 minutos.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => void loadPresence()}
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                    title="Atualizar visitantes online"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${onlineLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {onlineError ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-xs text-amber-100">
                  <div className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{onlineError}</span>
                  </div>
                </div>
              ) : onlineLoading && onlineVisitors.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">Carregando visitantes online...</div>
              ) : onlineVisitors.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">Nenhum visitante ativo no momento.</div>
              ) : (
                <div className="space-y-2">
                  {onlineVisitors.map((visitor, index) => (
                    <div
                      key={`${visitor.lastSeenAt}-${visitor.lastPath}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">Visitante ativo</p>
                          <p className="truncate text-[11px] text-slate-400">Página: {visitor.lastPath}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatPresenceTime(visitor.lastSeenAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "links" ? (
            filteredLinks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {links.length === 0 ? "Nenhum link encontrado." : "Nenhum link corresponde à pesquisa."}
              </div>
            ) : (
              filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white truncate">{link.title}</span>
                      <span className="text-[11px] text-cyan-300 font-mono">{link.handle}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          link.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : link.status === "pending"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {link.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{link.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      onClick={() => void handleUpdateLink(link.id, { isVerified: !link.isVerified })}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        link.isVerified
                          ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/40"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                      title="Alternar verificação"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verificado</span>
                    </button>

                    <button
                      onClick={() => void handleUpdateLink(link.id, { isFeatured: !link.isFeatured })}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        link.isFeatured
                          ? "bg-amber-500/25 text-amber-200 border border-amber-400/40"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                      title="Alternar destaque"
                    >
                      <Flame className="w-3 h-3" />
                      <span>Destaque</span>
                    </button>

                    {link.status !== "approved" && (
                      <button
                        onClick={() => void handleUpdateLink(link.id, { status: "approved" })}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/30 text-emerald-200 text-[11px] font-bold hover:bg-emerald-500/40"
                      >
                        Aprovar
                      </button>
                    )}
                    {link.status !== "rejected" && (
                      <button
                        onClick={() => void handleUpdateLink(link.id, { status: "rejected" })}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/30 text-rose-200 text-[11px] font-bold hover:bg-rose-500/40"
                      >
                        Recusar
                      </button>
                    )}
                    <button
                      onClick={() => setEditingLink(link)}
                      className="px-2.5 py-1 rounded-xl bg-indigo-500/25 text-indigo-200 text-[11px] font-bold hover:bg-indigo-500/40 flex items-center gap-1"
                      title="Editar informações do link"
                    >
                      <span aria-hidden="true">✎</span>
                      Editar
                    </button>
                    <button
                      onClick={() => void handleDeleteLink(link)}
                      disabled={deletingLinkId === link.id}
                      className="px-2.5 py-1 rounded-xl bg-rose-950/70 text-rose-200 text-[11px] font-bold hover:bg-rose-900/80 disabled:cursor-wait disabled:opacity-50 flex items-center gap-1"
                      title="Excluir permanentemente"
                    >
                      {deletingLinkId === link.id ? (
                        <LoaderCircle className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Nenhuma denúncia recebida.</div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                      Motivo: {report.reason}
                    </span>
                    <span className={`text-[10px] uppercase ${report.status === "resolved" ? "text-emerald-300" : "text-amber-300"}`}>
                      {report.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">ID do link: #{report.linkId}</span>
                </div>
                <p className="text-xs text-slate-300">{report.details || "Sem detalhes adicionais."}</p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => void handleUpdateReport(report.id, report.status === "resolved" ? "pending" : "resolved")}
                    className="px-2.5 py-1 rounded-xl bg-white/10 text-slate-200 text-[11px] font-semibold hover:bg-white/20"
                  >
                    {report.status === "resolved" ? "Reabrir" : "Marcar resolvida"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {editingLink && (
        <ModerationLinkEditModal
          link={editingLink}
          categories={categories}
          submitting={savingLink}
          onClose={() => setEditingLink(null)}
          onSave={(updates) => handleSaveEditedLink(editingLink.id, updates)}
        />
      )}
    </div>
  );
}

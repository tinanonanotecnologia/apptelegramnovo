"use client";

import { FormEvent, useEffect, useState } from "react";
import { getRedirectResult, onAuthStateChanged, signInWithRedirect, signOut, User } from "firebase/auth";
import { ArrowLeft, LogIn, LogOut, Send, ShieldCheck, X } from "lucide-react";
import { getFirebaseAuth, getGoogleProvider, isFirebaseClientConfigured } from "@/lib/firebase-client";

type Message = { id: number; uid: string; displayName: string; photoUrl?: string | null; text: string; createdAt: string };

export function GlobalChat({ onClose }: { onClose: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    const auth = getFirebaseAuth();
    void getRedirectResult(auth).catch((error: unknown) => {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
      setError(`Não foi possível concluir o login Google${code ? ` (${code})` : ""}.`);
    });
    return onAuthStateChanged(auth, setUser);
  }, []);
  useEffect(() => { fetch("/api/chat/messages", { cache: "no-store" }).then(r => r.json()).then(d => setMessages(d.data || [])).catch(() => setError("Não foi possível carregar o chat.")); }, []);

  const login = async () => {
    try {
      await signInWithRedirect(getFirebaseAuth(), getGoogleProvider());
    } catch (error: unknown) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
      setError(`Não foi possível iniciar o login Google${code ? ` (${code})` : ""}.`);
    }
  };
  const send = async (event: FormEvent) => {
    event.preventDefault(); if (!user || !text.trim() || loading) return;
    setLoading(true); setError("");
    try { const token = await user.getIdToken(); const res = await fetch("/api/chat/messages", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ text }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setMessages((v) => [...v, data.data]); setText(""); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao enviar mensagem."); } finally { setLoading(false); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md">
    <div className="glass-modal flex h-[min(720px,92vh)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950/90">
      <header className="flex items-center gap-3 border-b border-white/10 p-4"><button onClick={onClose} className="rounded-xl p-2 text-slate-300 hover:bg-white/10"><ArrowLeft /></button><div className="flex-1"><h2 className="text-lg font-bold text-white">Chat Telegram Hub</h2><p className="text-xs text-emerald-300">Conversa global da comunidade</p></div><ShieldCheck className="text-cyan-300" /><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10"><X /></button></header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map(m => <div key={m.id} className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">{m.photoUrl ? <img src={m.photoUrl} alt="" className="h-6 w-6 rounded-full" /> : null}{m.displayName}<span className="ml-auto text-[10px] text-slate-500">{new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div><p className="mt-1 text-sm text-slate-200">{m.text}</p></div>)}</div>
      {error && <p className="px-4 text-xs text-rose-300">{error}</p>}
      {!isFirebaseClientConfigured() ? <div className="border-t border-white/10 p-4 text-center text-sm text-amber-200">O login Google ainda precisa ser configurado no Firebase e na Vercel.</div> : !user ? <div className="border-t border-white/10 p-5 text-center"><p className="mb-3 text-sm text-slate-300">Entre com sua conta Gmail para participar do chat global.</p><button onClick={login} className="mx-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 font-semibold text-slate-950"><LogIn className="h-4 w-4" />Entrar com Google</button></div> : <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-4"><input value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder="Escreva uma mensagem..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" /><button disabled={loading} className="rounded-xl bg-cyan-400 p-3 text-slate-950"><Send className="h-4 w-4" /></button><button type="button" onClick={() => void signOut(getFirebaseAuth())} title="Sair" className="rounded-xl border border-white/10 p-3 text-slate-400"><LogOut className="h-4 w-4" /></button></form>}
    </div></div>;
}

import { NextRequest, NextResponse } from "next/server";
import { desc, gt } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { getFirebaseAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

async function authenticatedUser(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  try { return await (await getFirebaseAuth()).verifyIdToken(header.slice(7)); } catch { return null; }
}

export async function GET(request: NextRequest) {
  try {
    const since = Number(new URL(request.url).searchParams.get("since") || 0);
    const rows = await db.select().from(chatMessages)
      .where(since > 0 ? gt(chatMessages.id, since) : undefined)
      .orderBy(desc(chatMessages.createdAt)).limit(100);
    return NextResponse.json({ success: true, data: rows.reverse() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error loading global chat:", error);
    return NextResponse.json({ success: false, error: "A tabela do chat ainda não está disponível. Confirme a migração no Neon." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Faça login com o Google para participar do chat." }, { status: 401 });
  const body = await request.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 500) return NextResponse.json({ success: false, error: "A mensagem deve ter entre 1 e 500 caracteres." }, { status: 400 });
  try {
    const [message] = await db.insert(chatMessages).values({
      uid: user.uid,
      email: user.email || "",
      displayName: user.name?.trim().slice(0, 80) || "Membro do Telegram Hub",
      photoUrl: user.picture || null,
      text,
    }).returning();
    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error("Error saving global chat message:", error);
    return NextResponse.json({ success: false, error: "Não foi possível salvar a mensagem. Confirme a tabela do chat no Neon." }, { status: 503 });
  }
}

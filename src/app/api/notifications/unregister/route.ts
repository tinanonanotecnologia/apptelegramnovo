import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (token.length < 10 || token.length > 4096) {
      return NextResponse.json({ success: false, error: "Token inválido." }, { status: 400 });
    }

    await db.update(pushTokens).set({ enabled: false, updatedAt: new Date() }).where(eq(pushTokens.token, token));
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error unregistering push token:", error);
    return NextResponse.json({ success: false, error: "Não foi possível desativar o dispositivo." }, { status: 500 });
  }
}

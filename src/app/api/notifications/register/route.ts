import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushTokens } from "@/db/schema";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_MAX_LENGTH = 4096;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      token?: unknown;
      installationId?: unknown;
      platform?: unknown;
    } | null;
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const installationId = typeof body?.installationId === "string" ? body.installationId.trim() : "";
    const platform = body?.platform === "android" || body?.platform === "web" ? body.platform : "android";

    if (token.length < 10 || token.length > TOKEN_MAX_LENGTH || !UUID_PATTERN.test(installationId)) {
      return NextResponse.json({ success: false, error: "Token de notificação inválido." }, { status: 400 });
    }

    const now = new Date();
    await db
      .insert(pushTokens)
      .values({ token, installationId, platform, enabled: true, lastSeenAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: pushTokens.token,
        set: { installationId, platform, enabled: true, lastSeenAt: now, updatedAt: now },
      });

    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error registering push token:", error);
    return NextResponse.json({ success: false, error: "Não foi possível registrar o dispositivo." }, { status: 500 });
  }
}

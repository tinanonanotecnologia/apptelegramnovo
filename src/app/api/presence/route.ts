import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { onlinePresence } from "@/db/schema";

const VISITOR_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      visitorId?: unknown;
      path?: unknown;
    } | null;
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId.trim() : "";
    const path = typeof body?.path === "string" ? body.path.trim() : "/";

    if (!VISITOR_ID_PATTERN.test(visitorId) || path.length > 200 || !path.startsWith("/")) {
      return NextResponse.json({ success: false, error: "Dados de presença inválidos." }, { status: 400 });
    }

    await db
      .insert(onlinePresence)
      .values({ visitorId, lastSeenAt: new Date(), lastPath: path })
      .onConflictDoUpdate({
        target: onlinePresence.visitorId,
        set: { lastSeenAt: new Date(), lastPath: path },
      });

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error recording online presence:", error);
    return NextResponse.json({ success: false, error: "Não foi possível registrar a presença." }, { status: 500 });
  }
}

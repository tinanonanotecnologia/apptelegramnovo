import { NextResponse } from "next/server";
import { db } from "@/db";
import { onlinePresence } from "@/db/schema";
import { count, desc, gte, lt } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const RETENTION_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Autenticação necessária." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const now = Date.now();
    const onlineSince = new Date(now - ONLINE_WINDOW_MS);
    const retentionSince = new Date(now - RETENTION_WINDOW_MS);

    await db.delete(onlinePresence).where(lt(onlinePresence.lastSeenAt, retentionSince));

    const [{ value: onlineCount }] = await db
      .select({ value: count() })
      .from(onlinePresence)
      .where(gte(onlinePresence.lastSeenAt, onlineSince));

    const visitors = await db
      .select({ lastSeenAt: onlinePresence.lastSeenAt, lastPath: onlinePresence.lastPath })
      .from(onlinePresence)
      .where(gte(onlinePresence.lastSeenAt, onlineSince))
      .orderBy(desc(onlinePresence.lastSeenAt))
      .limit(100);

    return NextResponse.json(
      {
        success: true,
        data: {
          onlineCount: Number(onlineCount),
          onlineSince: onlineSince.toISOString(),
          visitors,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error loading online presence:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar o monitoramento online." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

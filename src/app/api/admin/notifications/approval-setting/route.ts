import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const SETTING_KEY = "approval_notifications_enabled";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ success: false, error: "Autenticação necessária." }, { status: 401 });
  const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, SETTING_KEY));
  return NextResponse.json({ success: true, enabled: setting?.value !== "false" });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ success: false, error: "Autenticação necessária." }, { status: 401 });
  const body = await request.json().catch(() => null) as { enabled?: unknown } | null;
  if (typeof body?.enabled !== "boolean") return NextResponse.json({ success: false, error: "Valor inválido." }, { status: 400 });
  await db.insert(appSettings).values({ key: SETTING_KEY, value: String(body.enabled), updatedAt: new Date() }).onConflictDoUpdate({ target: appSettings.key, set: { value: String(body.enabled), updatedAt: new Date() } });
  return NextResponse.json({ success: true, enabled: body.enabled });
}

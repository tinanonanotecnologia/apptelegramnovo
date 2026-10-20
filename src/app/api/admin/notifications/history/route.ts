import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { notificationHistory } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Autenticação necessária." }, { status: 401 });
  }
  const history = await db.select().from(notificationHistory).orderBy(desc(notificationHistory.createdAt)).limit(100);
  return NextResponse.json({ success: true, data: history }, { headers: { "Cache-Control": "no-store" } });
}

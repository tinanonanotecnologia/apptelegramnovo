import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { telegramLinks } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ success: false, error: "Autenticação necessária." }, { status: 401 });
  const [totals, topLinks] = await Promise.all([
    db.select({ links: sql<number>`count(*)`, clicks: sql<number>`coalesce(sum(${telegramLinks.clicksCount}), 0)`, likes: sql<number>`coalesce(sum(${telegramLinks.likesCount}), 0)`, members: sql<number>`coalesce(sum(${telegramLinks.memberCount}), 0)` }).from(telegramLinks).where(eq(telegramLinks.status, "approved")),
    db.select({ id: telegramLinks.id, title: telegramLinks.title, clicks: telegramLinks.clicksCount, likes: telegramLinks.likesCount, members: telegramLinks.memberCount, rating: telegramLinks.ratingAvg }).from(telegramLinks).where(eq(telegramLinks.status, "approved")).orderBy(desc(telegramLinks.clicksCount)).limit(10),
  ]);
  return NextResponse.json({ success: true, data: { totals: totals[0], topLinks } }, { headers: { "Cache-Control": "no-store" } });
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { telegramLinks, categories } from "@/db/schema";
import { sql, eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totalLinksRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(telegramLinks)
      .where(eq(telegramLinks.status, "approved"));

    const totalClicksRes = await db
      .select({ sum: sql<number>`coalesce(sum(${telegramLinks.clicksCount}), 0)` })
      .from(telegramLinks)
      .where(eq(telegramLinks.status, "approved"));

    const totalMembersRes = await db
      .select({ sum: sql<number>`coalesce(sum(${telegramLinks.memberCount}), 0)` })
      .from(telegramLinks)
      .where(eq(telegramLinks.status, "approved"));

    const totalVerifiedRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(telegramLinks)
      .where(and(eq(telegramLinks.status, "approved"), eq(telegramLinks.isVerified, true)));

    const totalCatsRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalLinks: Number(totalLinksRes[0]?.count || 0),
          totalClicks: Number(totalClicksRes[0]?.sum || 0),
          totalMembers: Number(totalMembersRes[0]?.sum || 0),
          totalVerified: Number(totalVerifiedRes[0]?.count || 0),
          totalCategories: Number(totalCatsRes[0]?.count || 0),
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao buscar estatísticas" },
      { status: 500 }
    );
  }
}

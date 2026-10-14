import { NextResponse } from "next/server";
import { db } from "@/db";
import { curatedCollections, telegramLinks } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  try {
    let collections = await db
      .select()
      .from(curatedCollections)
      .orderBy(curatedCollections.order);

    if (collections.length === 0) {
      await seedDatabase();
      collections = await db
        .select()
        .from(curatedCollections)
        .orderBy(curatedCollections.order);
    }

    // Get all link ids across all collections
    const allLinkIds = Array.from(new Set(collections.flatMap((c) => c.linkIds || [])));

    let linksMap = new Map();
    if (allLinkIds.length > 0) {
      const links = await db
        .select({
          id: telegramLinks.id,
          title: telegramLinks.title,
          handle: telegramLinks.handle,
          url: telegramLinks.url,
          description: telegramLinks.description,
          type: telegramLinks.type,
          categoryId: telegramLinks.categoryId,
          memberCount: telegramLinks.memberCount,
          ratingAvg: telegramLinks.ratingAvg,
          ratingCount: telegramLinks.ratingCount,
          clicksCount: telegramLinks.clicksCount,
          likesCount: telegramLinks.likesCount,
          isVerified: telegramLinks.isVerified,
          isFeatured: telegramLinks.isFeatured,
          tags: telegramLinks.tags,
        })
        .from(telegramLinks)
        .where(and(inArray(telegramLinks.id, allLinkIds), eq(telegramLinks.status, "approved")));

      links.forEach((l) => linksMap.set(l.id, l));
    }

    const populated = collections.map((col) => ({
      ...col,
      links: (col.linkIds || [])
        .map((id) => linksMap.get(id))
        .filter(Boolean),
    }));

    return NextResponse.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao buscar coleções" },
      { status: 500 }
    );
  }
}

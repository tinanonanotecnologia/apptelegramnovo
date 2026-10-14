import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, telegramLinks } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  try {
    let allCategories = await db.select().from(categories).orderBy(categories.order);

    if (allCategories.length === 0) {
      await seedDatabase();
      allCategories = await db.select().from(categories).orderBy(categories.order);
    }

    // Get count of approved links per category
    const linkCounts = await db
      .select({
        categoryId: telegramLinks.categoryId,
        count: count(telegramLinks.id),
      })
      .from(telegramLinks)
      .where(eq(telegramLinks.status, "approved"))
      .groupBy(telegramLinks.categoryId);

    const countsMap = new Map(linkCounts.map((c) => [c.categoryId, Number(c.count)]));

    const enrichedCategories = allCategories.map((cat) => ({
      ...cat,
      linksCount: countsMap.get(cat.id) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: enrichedCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar categorias" },
      { status: 500 }
    );
  }
}

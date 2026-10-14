import { db } from "@/db";
import { categories, telegramLinks, curatedCollections } from "@/db/schema";
import { INITIAL_CATEGORIES, INITIAL_LINKS, INITIAL_COLLECTIONS } from "./seed-data";
import { eq, sql } from "drizzle-orm";

let seedInFlight: Promise<{ success: boolean; error?: string }> | null = null;

export async function seedDatabase() {
  if (seedInFlight) return seedInFlight;
  seedInFlight = seedDatabaseInternal();
  try {
    return await seedInFlight;
  } finally {
    seedInFlight = null;
  }
}

async function seedDatabaseInternal() {
  try {
    // 1. Seed categories
    const existingCats = await db.select().from(categories);
    if (existingCats.length === 0) {
      console.log("Seeding categories...");
      await db.insert(categories).values(INITIAL_CATEGORIES);
    }

    // 2. Seed Telegram Links
    const existingLinks = await db.select().from(telegramLinks);
    if (existingLinks.length === 0) {
      console.log("Seeding telegram links...");
      await db.insert(telegramLinks).values(INITIAL_LINKS);
    }

    // 3. Seed Collections
    const existingCollections = await db.select().from(curatedCollections);
    if (existingCollections.length === 0) {
      console.log("Seeding curated collections...");
      const allLinks = await db.select({ id: telegramLinks.id, categoryId: telegramLinks.categoryId, isFeatured: telegramLinks.isFeatured }).from(telegramLinks);

      const topBrasilIds = allLinks.filter(l => l.isFeatured).map(l => l.id).slice(0, 6);
      const botsIds = allLinks.filter(l => l.categoryId === "bots").map(l => l.id);
      const devsIds = allLinks.filter(l => l.categoryId === "tech-ia" || l.categoryId === "empregos-freela").map(l => l.id);
      const promosIds = allLinks.filter(l => l.categoryId === "promos" || l.categoryId === "jogos-gaming").map(l => l.id);

      const collectionsToInsert = INITIAL_COLLECTIONS.map(c => {
        let ids: number[] = [];
        if (c.id === "top-brasil") ids = topBrasilIds;
        else if (c.id === "bots-essenciais") ids = botsIds;
        else if (c.id === "devs-tech") ids = devsIds;
        else if (c.id === "economia-promos") ids = promosIds;
        return {
          ...c,
          linkIds: ids,
        };
      });

      await db.insert(curatedCollections).values(collectionsToInsert);
    }

    console.log("Database seeded successfully.");
    return { success: true };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error: String(error) };
  }
}

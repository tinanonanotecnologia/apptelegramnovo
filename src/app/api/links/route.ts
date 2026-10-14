import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { telegramLinks, categories } from "@/db/schema";
import { and, eq, ilike, or, desc, sql } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";
import {
  LINK_LANGUAGES,
  LINK_TYPES,
  asOptionalTrimmedString,
  asTrimmedString,
  isOneOf,
  normalizeTags,
  normalizeTelegramLink,
  parseBoundedInteger,
} from "@/app/api/_lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "trending";
    const featured = searchParams.get("featured");
    const verified = searchParams.get("verified");
    const language = searchParams.get("language");
    const requestedLimit = parseBoundedInteger(searchParams.get("limit"), { min: 1, max: 100, fallback: 50 });
    const offset = parseBoundedInteger(searchParams.get("offset"), { min: 0, max: 1_000_000, fallback: 0 });

    if (requestedLimit === null || offset === null) {
      return NextResponse.json({ success: false, error: "Paginação inválida." }, { status: 400 });
    }
    const limit = requestedLimit;

    if (type && type !== "all" && !isOneOf(type, LINK_TYPES)) {
      return NextResponse.json({ success: false, error: "Tipo de link inválido." }, { status: 400 });
    }
    if (language && language !== "all" && !isOneOf(language, LINK_LANGUAGES)) {
      return NextResponse.json({ success: false, error: "Idioma inválido." }, { status: 400 });
    }
    if (search && search.trim().length > 100) {
      return NextResponse.json({ success: false, error: "A busca deve ter no máximo 100 caracteres." }, { status: 400 });
    }

    // Auto-seed if empty
    const checkCount = await db.select({ count: sql<number>`count(*)` }).from(telegramLinks);
    if (Number(checkCount[0]?.count || 0) === 0) {
      await seedDatabase();
    }

    const conditions = [];

    // The public catalog never exposes pending or rejected submissions.
    conditions.push(eq(telegramLinks.status, "approved"));

    // Filter by category
    if (category && category !== "all") {
      conditions.push(eq(telegramLinks.categoryId, category));
    }

    // Filter by type
    if (type && type !== "all") {
      conditions.push(eq(telegramLinks.type, type));
    }

    // Filter by language
    if (language && language !== "all") {
      conditions.push(
        or(
          eq(telegramLinks.language, language),
          eq(telegramLinks.language, "global")
        )
      );
    }

    // Filter by verified
    if (verified === "true") {
      conditions.push(eq(telegramLinks.isVerified, true));
    }

    // Filter by featured
    if (featured === "true") {
      conditions.push(eq(telegramLinks.isFeatured, true));
    }

    // Search filter
    if (search && search.trim().length > 0) {
      const query = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          ilike(telegramLinks.title, query),
          ilike(telegramLinks.handle, query),
          ilike(telegramLinks.description, query),
          sql`${telegramLinks.tags}::text ILIKE ${query}`
        )
      );
    }

    // Determine sorting
    let orderByClause;
    switch (sort) {
      case "popular":
        orderByClause = desc(telegramLinks.memberCount);
        break;
      case "rating":
        orderByClause = desc(telegramLinks.ratingAvg);
        break;
      case "newest":
        orderByClause = desc(telegramLinks.createdAt);
        break;
      case "likes":
        orderByClause = desc(telegramLinks.likesCount);
        break;
      case "trending":
      default:
        orderByClause = desc(telegramLinks.clicksCount);
        break;
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const linksList = await db
      .select({
        id: telegramLinks.id,
        title: telegramLinks.title,
        handle: telegramLinks.handle,
        url: telegramLinks.url,
        description: telegramLinks.description,
        longDescription: telegramLinks.longDescription,
        type: telegramLinks.type,
        categoryId: telegramLinks.categoryId,
        tags: telegramLinks.tags,
        language: telegramLinks.language,
        memberCount: telegramLinks.memberCount,
        isVerified: telegramLinks.isVerified,
        isFeatured: telegramLinks.isFeatured,
        isNsfw: telegramLinks.isNsfw,
        ratingAvg: telegramLinks.ratingAvg,
        ratingCount: telegramLinks.ratingCount,
        clicksCount: telegramLinks.clicksCount,
        likesCount: telegramLinks.likesCount,
        status: telegramLinks.status,
        avatarUrl: telegramLinks.avatarUrl,
        submittedBy: telegramLinks.submittedBy,
        createdAt: telegramLinks.createdAt,
        updatedAt: telegramLinks.updatedAt,
      })
      .from(telegramLinks)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Get total count matching query
    const totalCountRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(telegramLinks)
      .where(whereClause);

    const total = Number(totalCountRes[0]?.count || 0);

    return NextResponse.json({
      success: true,
      data: linksList,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + linksList.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao buscar links do Telegram" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Corpo da requisição inválido." }, { status: 400 });
    }

    let {
      title,
      handle,
      url,
      description,
      longDescription,
      type = "channel",
      categoryId,
      tags = [],
      language = "pt",
      memberCount = 100,
      submittedBy = "Comunidade",
      isNsfw = false,
    } = body;

    const cleanTitle = asTrimmedString(title, 160);
    const cleanDescription = asTrimmedString(description, 2_000);
    const cleanCategoryId = asTrimmedString(categoryId, 80);
    if (!cleanTitle || !cleanDescription || !cleanCategoryId) {
      return NextResponse.json(
        { success: false, error: "Título, descrição e categoria são obrigatórios." },
        { status: 400 }
      );
    }

    const normalizedTelegram = normalizeTelegramLink({ handle, url });
    if ("error" in normalizedTelegram) {
      return NextResponse.json({ success: false, error: normalizedTelegram.error }, { status: 400 });
    }

    if (!isOneOf(type, LINK_TYPES)) {
      return NextResponse.json({ success: false, error: "Tipo de link inválido." }, { status: 400 });
    }
    if (!isOneOf(language, LINK_LANGUAGES)) {
      return NextResponse.json({ success: false, error: "Idioma inválido." }, { status: 400 });
    }
    const parsedTags = normalizeTags(tags);
    if (!parsedTags) {
      return NextResponse.json({ success: false, error: "As tags informadas são inválidas." }, { status: 400 });
    }
    const cleanLongDescription = asOptionalTrimmedString(longDescription, 10_000);
    const cleanSubmittedBy = asOptionalTrimmedString(submittedBy, 100) || "Comunidade";
    if (longDescription !== undefined && longDescription !== null && longDescription !== "" && !cleanLongDescription) {
      return NextResponse.json({ success: false, error: "A descrição longa deve ter no máximo 10.000 caracteres." }, { status: 400 });
    }
    if (submittedBy !== undefined && submittedBy !== null && submittedBy !== "" && !cleanSubmittedBy) {
      return NextResponse.json({ success: false, error: "O nome do remetente é inválido." }, { status: 400 });
    }
    if (isNsfw !== undefined && typeof isNsfw !== "boolean") {
      return NextResponse.json({ success: false, error: "O campo NSFW deve ser booleano." }, { status: 400 });
    }
    const cleanMemberCount = parseBoundedInteger(memberCount, { min: 0, max: 2_000_000_000, fallback: 100 });
    if (cleanMemberCount === null) {
      return NextResponse.json({ success: false, error: "Quantidade de membros inválida." }, { status: 400 });
    }

    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, cleanCategoryId));
    if (!category) {
      return NextResponse.json({ success: false, error: "A categoria informada não existe." }, { status: 400 });
    }

    const [inserted] = await db
      .insert(telegramLinks)
      .values({
        title: cleanTitle,
        handle: normalizedTelegram.handle,
        url: normalizedTelegram.url,
        description: cleanDescription,
        longDescription: cleanLongDescription,
        type,
        categoryId: cleanCategoryId,
        tags: parsedTags,
        language,
        memberCount: cleanMemberCount,
        isVerified: false,
        isFeatured: false,
        isNsfw: isNsfw === true,
        ratingAvg: "0.00",
        ratingCount: 0,
        clicksCount: 0,
        likesCount: 0,
        status: "pending",
        submittedBy: cleanSubmittedBy,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Link enviado para moderação.",
      data: inserted,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao adicionar o link do Telegram" },
      { status: 500 }
    );
  }
}

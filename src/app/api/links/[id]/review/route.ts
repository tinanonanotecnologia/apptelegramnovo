import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { telegramLinks, reviews } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { asOptionalTrimmedString, asTrimmedString, parseBoundedInteger } from "@/app/api/_lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const linkId = parseBoundedInteger(id, { min: 1, max: Number.MAX_SAFE_INTEGER });

    if (linkId === null) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const [link] = await db
      .select({ id: telegramLinks.id })
      .from(telegramLinks)
      .where(and(eq(telegramLinks.id, linkId), eq(telegramLinks.status, "approved")));
    if (!link) {
      return NextResponse.json({ success: false, error: "Link não encontrado" }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Corpo da requisição inválido." }, { status: 400 });
    }
    const { authorName = "Usuário", rating = 5, comment } = body;

    const cleanComment = asTrimmedString(comment, 2_000);
    if (!cleanComment) {
      return NextResponse.json({ success: false, error: "O comentário é obrigatório." }, { status: 400 });
    }

    const numRating = parseBoundedInteger(rating, { min: 1, max: 5 });
    if (numRating === null) {
      return NextResponse.json({ success: false, error: "A avaliação deve ser um número inteiro entre 1 e 5." }, { status: 400 });
    }
    const cleanAuthorName = asOptionalTrimmedString(authorName, 100) || "Usuário";
    if (authorName !== undefined && authorName !== null && authorName !== "" && !asOptionalTrimmedString(authorName, 100)) {
      return NextResponse.json({ success: false, error: "Nome do autor inválido." }, { status: 400 });
    }

    // 1. Insert review
    const [newReview] = await db
      .insert(reviews)
      .values({
        linkId,
        authorName: cleanAuthorName,
        rating: numRating,
        comment: cleanComment,
      })
      .returning();

    // 2. Recalculate average
    const allReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.linkId, linkId));

    const totalRatings = allReviews.length;
    const sumRatings = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const newAvg = (sumRatings / totalRatings).toFixed(2);

    await db
      .update(telegramLinks)
      .set({
        ratingAvg: newAvg,
        ratingCount: totalRatings,
      })
      .where(eq(telegramLinks.id, linkId));

    return NextResponse.json({
      success: true,
      data: newReview,
      newAvg,
      totalRatings,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ success: false, error: "Erro ao enviar avaliação" }, { status: 500 });
  }
}

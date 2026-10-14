import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { telegramLinks } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const linkId = Number(id);

    if (isNaN(linkId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const [updated] = await db
      .update(telegramLinks)
      .set({
        likesCount: sql`${telegramLinks.likesCount} + 1`,
      })
      .where(and(eq(telegramLinks.id, linkId), eq(telegramLinks.status, "approved")))
      .returning({ id: telegramLinks.id, likesCount: telegramLinks.likesCount });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Link não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      likesCount: updated.likesCount,
    });
  } catch (error) {
    console.error("Error updating likes count:", error);
    return NextResponse.json({ success: false, error: "Erro ao registrar curtida" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { linkReports, telegramLinks } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { REPORT_REASONS, asOptionalTrimmedString, isOneOf, parseBoundedInteger } from "@/app/api/_lib/validation";

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
    const reason = body?.reason ?? "broken_link";
    if (!isOneOf(reason, REPORT_REASONS)) {
      return NextResponse.json({ success: false, error: "Motivo de denúncia inválido." }, { status: 400 });
    }
    const details = asOptionalTrimmedString(body?.details, 2_000);
    if (body?.details !== undefined && body?.details !== null && body?.details !== "" && !details) {
      return NextResponse.json({ success: false, error: "Os detalhes devem ter no máximo 2.000 caracteres." }, { status: 400 });
    }

    const [report] = await db
      .insert(linkReports)
      .values({
        linkId,
        reason,
        details,
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Denúncia recebida. Nossa equipe irá analisar.",
      data: report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ success: false, error: "Falha ao enviar denúncia" }, { status: 500 });
  }
}

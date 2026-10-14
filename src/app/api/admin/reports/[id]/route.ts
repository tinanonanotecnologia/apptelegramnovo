import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { linkReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isOneOf } from "@/app/api/_lib/validation";

const REPORT_STATUSES = ["pending", "resolved"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Autenticação necessária." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const { id } = await params;
    const reportId = Number(id);
    if (!Number.isSafeInteger(reportId) || reportId < 1) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
    const status = body?.status;
    if (!isOneOf(status, REPORT_STATUSES)) {
      return NextResponse.json({ success: false, error: "Status de denúncia inválido." }, { status: 400 });
    }

    const [updated] = await db
      .update(linkReports)
      .set({ status })
      .where(eq(linkReports.id, reportId))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Denúncia não encontrada" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Denúncia atualizada.", data: updated },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ success: false, error: "Falha ao atualizar denúncia" }, { status: 500 });
  }
}


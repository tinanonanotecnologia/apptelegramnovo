import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { telegramLinks, linkReports } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { LINK_STATUSES, isOneOf } from "@/app/api/_lib/validation";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Autenticação necessária." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    if (status !== "all" && !isOneOf(status, LINK_STATUSES)) {
      return NextResponse.json({ success: false, error: "Status inválido." }, { status: 400 });
    }

    const linksQuery = db.select().from(telegramLinks).orderBy(desc(telegramLinks.createdAt));
    
    let allLinks;
    if (status !== "all") {
      allLinks = await linksQuery.where(eq(telegramLinks.status, status));
    } else {
      allLinks = await linksQuery;
    }

    const reports = await db
      .select()
      .from(linkReports)
      .orderBy(desc(linkReports.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: {
        links: allLinks,
        reports,
      },
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar painel administrativo" },
      { status: 500 }
    );
  }
}

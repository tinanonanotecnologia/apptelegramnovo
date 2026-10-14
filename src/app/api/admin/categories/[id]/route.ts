import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, telegramLinks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { asOptionalTrimmedString, asTrimmedString, parseBoundedInteger } from "@/app/api/_lib/validation";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function unauthorized() {
  return NextResponse.json({ success: false, error: "Autenticação necessária." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  if (!ID_PATTERN.test(id)) return NextResponse.json({ success: false, error: "ID inválido." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ success: false, error: "Corpo da requisição inválido." }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const value = asTrimmedString(body.name, 120);
    if (!value) return NextResponse.json({ success: false, error: "Nome inválido." }, { status: 400 });
    updateData.name = value;
  }
  if (body.slug !== undefined) {
    const value = asTrimmedString(body.slug, 80)?.toLowerCase().replace(/\s+/g, "-");
    if (!value || !ID_PATTERN.test(value)) return NextResponse.json({ success: false, error: "Slug inválido." }, { status: 400 });
    updateData.slug = value;
  }
  if (body.icon !== undefined) {
    const value = asTrimmedString(body.icon, 60);
    if (!value) return NextResponse.json({ success: false, error: "Ícone inválido." }, { status: 400 });
    updateData.icon = value;
  }
  if (body.description !== undefined) {
    const value = asTrimmedString(body.description, 500);
    if (!value) return NextResponse.json({ success: false, error: "Descrição inválida." }, { status: 400 });
    updateData.description = value;
  }
  if (body.gradient !== undefined) updateData.gradient = asOptionalTrimmedString(body.gradient, 200) || "from-blue-500/20 to-cyan-500/20";
  if (body.order !== undefined) {
    const value = parseBoundedInteger(body.order, { min: 0, max: 100_000 });
    if (value === null) return NextResponse.json({ success: false, error: "Ordem inválida." }, { status: 400 });
    updateData.order = value;
  }
  if (Object.keys(updateData).length === 0) return NextResponse.json({ success: false, error: "Nenhuma alteração informada." }, { status: 400 });

  try {
    const [updated] = await db.update(categories).set(updateData).where(eq(categories.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, error: "Categoria não encontrada." }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: "Categoria atualizada." });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ success: false, error: "Não foi possível atualizar a categoria. Verifique se o slug já existe." }, { status: 409 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  if (!ID_PATTERN.test(id)) return NextResponse.json({ success: false, error: "ID inválido." }, { status: 400 });

  try {
    const [{ linksCount }] = await db.select({ linksCount: sql<number>`count(*)` }).from(telegramLinks).where(eq(telegramLinks.categoryId, id));
    if (Number(linksCount) > 0) return NextResponse.json({ success: false, error: "Não é possível excluir uma categoria que possui links." }, { status: 409 });
    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    if (!deleted) return NextResponse.json({ success: false, error: "Categoria não encontrada." }, { status: 404 });
    return NextResponse.json({ success: true, message: "Categoria excluída." });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, error: "Não foi possível excluir a categoria." }, { status: 500 });
  }
}

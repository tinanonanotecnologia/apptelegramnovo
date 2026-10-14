import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, telegramLinks } from "@/db/schema";
import { asc, count, eq, or } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { asOptionalTrimmedString, asTrimmedString, parseBoundedInteger } from "@/app/api/_lib/validation";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Autenticação necessária." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

async function readCategoryPayload(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return { error: "Corpo da requisição inválido." } as const;

  const rawSlug = asTrimmedString(body.slug, 80)?.toLowerCase().replace(/\s+/g, "-");
  const rawId = asOptionalTrimmedString(body.id, 80)?.toLowerCase() || rawSlug;
  const name = asTrimmedString(body.name, 120);
  const description = asTrimmedString(body.description, 500);
  const icon = asTrimmedString(body.icon, 60);
  const gradient = asOptionalTrimmedString(body.gradient, 200) || "from-blue-500/20 to-cyan-500/20";
  const order = parseBoundedInteger(body.order, { min: 0, max: 100_000, fallback: 0 });

  if (!rawId || !ID_PATTERN.test(rawId)) return { error: "ID inválido. Use letras minúsculas, números e hífens." } as const;
  if (!rawSlug || !ID_PATTERN.test(rawSlug)) return { error: "Slug inválido. Use letras minúsculas, números e hífens." } as const;
  if (!name || !description || !icon || order === null) return { error: "Nome, slug, ícone, descrição e ordem são obrigatórios." } as const;

  return {
    value: { id: rawId, name, slug: rawSlug, icon, description, gradient, order },
  } as const;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
        description: categories.description,
        gradient: categories.gradient,
        order: categories.order,
        createdAt: categories.createdAt,
        linksCount: count(telegramLinks.id),
      })
      .from(categories)
      .leftJoin(telegramLinks, eq(telegramLinks.categoryId, categories.id))
      .groupBy(
        categories.id,
        categories.name,
        categories.slug,
        categories.icon,
        categories.description,
        categories.gradient,
        categories.order,
        categories.createdAt
      )
      .orderBy(asc(categories.order), asc(categories.name));

    return NextResponse.json(
      {
        success: true,
        data: rows.map((category) => ({ ...category, linksCount: Number(category.linksCount) })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    return NextResponse.json({ success: false, error: "Falha ao carregar categorias." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const parsed = await readCategoryPayload(request);
  if ("error" in parsed) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

  try {
    const [existing] = await db
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(or(eq(categories.id, parsed.value.id), eq(categories.slug, parsed.value.slug)))
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Já existe uma categoria com o ID ou slug “${existing.slug}”. Escolha outro slug.` },
        { status: 409 }
      );
    }

    const [created] = await db.insert(categories).values(parsed.value).returning();
    return NextResponse.json({ success: true, data: created, message: "Categoria criada." }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    const errorCode = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (errorCode === "42P01") {
      return NextResponse.json({ success: false, error: "A tabela de categorias ainda não existe. Execute pnpm run db:push usando a DATABASE_URL do Neon." }, { status: 503 });
    }
    if (errorCode === "23505") {
      return NextResponse.json({ success: false, error: "O ID ou slug informado já existe. Escolha outro slug." }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Não foi possível criar a categoria. Verifique os logs do banco." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { telegramLinks, categories, reviews } from "@/db/schema";
import { eq, desc, ne, and } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  LINK_STATUSES,
  LINK_LANGUAGES,
  LINK_TYPES,
  asOptionalTrimmedString,
  asTrimmedString,
  isOneOf,
  normalizeTelegramLink,
  normalizeTags,
  parseBoundedInteger,
} from "@/app/api/_lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const linkId = parseBoundedInteger(id, { min: 1, max: Number.MAX_SAFE_INTEGER });

    if (linkId === null) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const [link] = await db
      .select()
      .from(telegramLinks)
      .where(and(eq(telegramLinks.id, linkId), eq(telegramLinks.status, "approved")));

    if (!link) {
      return NextResponse.json(
        { success: false, error: "Link não encontrado" },
        { status: 404 }
      );
    }

    // Fetch category
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, link.categoryId));

    // Fetch reviews
    const linkReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.linkId, linkId))
      .orderBy(desc(reviews.createdAt))
      .limit(20);

    // Fetch related links in same category
    const relatedLinks = await db
      .select({
        id: telegramLinks.id,
        title: telegramLinks.title,
        handle: telegramLinks.handle,
        url: telegramLinks.url,
        description: telegramLinks.description,
        type: telegramLinks.type,
        memberCount: telegramLinks.memberCount,
        ratingAvg: telegramLinks.ratingAvg,
        clicksCount: telegramLinks.clicksCount,
        isVerified: telegramLinks.isVerified,
      })
      .from(telegramLinks)
      .where(
        and(
          eq(telegramLinks.categoryId, link.categoryId),
          eq(telegramLinks.status, "approved"),
          ne(telegramLinks.id, linkId)
        )
      )
      .limit(4);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...link,
          category: cat || null,
          reviews: linkReviews,
          related: relatedLinks,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Error fetching link details:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar detalhes" },
      { status: 500 }
    );
  }
}

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
    const linkId = parseBoundedInteger(id, { min: 1, max: Number.MAX_SAFE_INTEGER });

    if (linkId === null) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Corpo da requisição inválido." }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(telegramLinks)
      .where(eq(telegramLinks.id, linkId));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Link não encontrado." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const {
      status,
      isFeatured,
      isVerified,
      isNsfw,
      title,
      handle,
      url,
      description,
      longDescription,
      categoryId,
      type,
      language,
      tags,
      memberCount,
      submittedBy,
    } = body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      if (!isOneOf(status, LINK_STATUSES)) {
        return NextResponse.json({ success: false, error: "Status inválido." }, { status: 400 });
      }
      updateData.status = status;
    }
    if (isFeatured !== undefined) {
      if (typeof isFeatured !== "boolean") {
        return NextResponse.json({ success: false, error: "O campo destaque deve ser booleano." }, { status: 400 });
      }
      updateData.isFeatured = isFeatured;
    }
    if (isVerified !== undefined) {
      if (typeof isVerified !== "boolean") {
        return NextResponse.json({ success: false, error: "O campo verificado deve ser booleano." }, { status: 400 });
      }
      updateData.isVerified = isVerified;
    }
    if (isNsfw !== undefined) {
      if (typeof isNsfw !== "boolean") {
        return NextResponse.json({ success: false, error: "O campo NSFW deve ser booleano." }, { status: 400 });
      }
      updateData.isNsfw = isNsfw;
    }
    if (title !== undefined) {
      const cleanTitle = asTrimmedString(title, 160);
      if (!cleanTitle) return NextResponse.json({ success: false, error: "Título inválido." }, { status: 400 });
      updateData.title = cleanTitle;
    }
    if (description !== undefined) {
      const cleanDescription = asTrimmedString(description, 2_000);
      if (!cleanDescription) return NextResponse.json({ success: false, error: "Descrição inválida." }, { status: 400 });
      updateData.description = cleanDescription;
    }
    if (longDescription !== undefined) {
      if (longDescription === null || longDescription === "") {
        updateData.longDescription = null;
      } else {
        const cleanLongDescription = asOptionalTrimmedString(longDescription, 10_000);
        if (!cleanLongDescription) {
          return NextResponse.json(
            { success: false, error: "A descrição longa deve ter no máximo 10.000 caracteres." },
            { status: 400 }
          );
        }
        updateData.longDescription = cleanLongDescription;
      }
    }
    if (handle !== undefined || url !== undefined) {
      const normalizedTelegram = normalizeTelegramLink({
        // If only one side changes, derive the other side from the new value
        // instead of leaving a stale handle/URL pair behind.
        handle: handle === undefined && url !== undefined ? undefined : handle ?? existing.handle,
        url: url === undefined && handle !== undefined ? undefined : url ?? existing.url,
      });
      if ("error" in normalizedTelegram) {
        return NextResponse.json({ success: false, error: normalizedTelegram.error }, { status: 400 });
      }
      updateData.handle = normalizedTelegram.handle;
      updateData.url = normalizedTelegram.url;
    }
    if (categoryId !== undefined) {
      const cleanCategoryId = asTrimmedString(categoryId, 80);
      if (!cleanCategoryId) {
        return NextResponse.json({ success: false, error: "Categoria inválida." }, { status: 400 });
      }
      const [category] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, cleanCategoryId));
      if (!category) {
        return NextResponse.json({ success: false, error: "A categoria informada não existe." }, { status: 400 });
      }
      updateData.categoryId = cleanCategoryId;
    }
    if (type !== undefined) {
      if (!isOneOf(type, LINK_TYPES)) {
        return NextResponse.json({ success: false, error: "Tipo de link inválido." }, { status: 400 });
      }
      updateData.type = type;
    }
    if (language !== undefined) {
      if (!isOneOf(language, LINK_LANGUAGES)) {
        return NextResponse.json({ success: false, error: "Idioma inválido." }, { status: 400 });
      }
      updateData.language = language;
    }
    if (memberCount !== undefined) {
      const cleanMemberCount = parseBoundedInteger(memberCount, { min: 0, max: 2_000_000_000 });
      if (cleanMemberCount === null) {
        return NextResponse.json({ success: false, error: "Quantidade de membros inválida." }, { status: 400 });
      }
      updateData.memberCount = cleanMemberCount;
    }
    if (tags !== undefined) {
      const normalizedTags = normalizeTags(tags);
      if (!normalizedTags) return NextResponse.json({ success: false, error: "Tags inválidas." }, { status: 400 });
      updateData.tags = normalizedTags;
    }
    if (submittedBy !== undefined) {
      if (submittedBy === null || submittedBy === "") {
        updateData.submittedBy = "Comunidade";
      } else {
        const cleanSubmittedBy = asOptionalTrimmedString(submittedBy, 100);
        if (!cleanSubmittedBy) {
          return NextResponse.json({ success: false, error: "O nome do remetente é inválido." }, { status: 400 });
        }
        updateData.submittedBy = cleanSubmittedBy;
      }
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ success: false, error: "Nenhuma alteração informada." }, { status: 400 });
    }

    const [updated] = await db
      .update(telegramLinks)
      .set(updateData)
      .where(eq(telegramLinks.id, linkId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Link atualizado com sucesso",
        data: updated,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const linkId = parseBoundedInteger(id, { min: 1, max: Number.MAX_SAFE_INTEGER });

    if (linkId === null) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    // Reviews and reports reference links with ON DELETE CASCADE in the
    // schema, so removing the link also removes its dependent moderation data.
    const [deleted] = await db
      .delete(telegramLinks)
      .where(eq(telegramLinks.id, linkId))
      .returning({ id: telegramLinks.id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Link não encontrado" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Link excluído permanentemente.",
        data: deleted,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao excluir link" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

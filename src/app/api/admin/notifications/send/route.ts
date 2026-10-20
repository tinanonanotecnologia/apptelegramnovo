import { NextRequest, NextResponse } from "next/server";
import { getFirebaseMessaging } from "@/lib/firebase-admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db } from "@/db";
import { pushTokens } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const MAX_BATCH_SIZE = 500;

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Autenticação necessária." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      title?: unknown;
      body?: unknown;
      url?: unknown;
    } | null;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const messageBody = typeof body?.body === "string" ? body.body.trim() : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "/";

    if (!title || title.length > 100 || !messageBody || messageBody.length > 500 || url.length > 500) {
      return NextResponse.json({ success: false, error: "Título, mensagem ou link inválido." }, { status: 400 });
    }

    const activeTokens = await db.select({ id: pushTokens.id, token: pushTokens.token })
      .from(pushTokens)
      .where(eq(pushTokens.enabled, true));

    if (activeTokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0, failed: 0, message: "Nenhum dispositivo registrado." });
    }

    const messaging = getFirebaseMessaging();
    let sent = 0;
    let failed = 0;
    const invalidTokenIds: number[] = [];

    for (let index = 0; index < activeTokens.length; index += MAX_BATCH_SIZE) {
      const batch = activeTokens.slice(index, index + MAX_BATCH_SIZE);
      const result = await messaging.sendEachForMulticast({
        tokens: batch.map(({ token }) => token),
        notification: { title, body: messageBody },
        data: { url },
        android: { priority: "high" },
      });

      sent += result.successCount;
      failed += result.failureCount;
      result.responses.forEach((response, responseIndex) => {
        const code = response.error?.code;
        if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
          invalidTokenIds.push(batch[responseIndex].id);
        }
      });
    }

    if (invalidTokenIds.length > 0) {
      await db.update(pushTokens).set({ enabled: false, updatedAt: new Date() }).where(inArray(pushTokens.id, invalidTokenIds));
    }

    return NextResponse.json({ success: true, sent, failed, disabled: invalidTokenIds.length });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json({ success: false, error: "Não foi possível enviar a notificação." }, { status: 500 });
  }
}

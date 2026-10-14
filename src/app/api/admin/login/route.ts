import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  isAdminAuthConfigured,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "O acesso à moderação ainda não foi configurado no servidor.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { username?: unknown; password?: unknown }
    | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (username.length > 100 || password.length > 256 || !username || !password) {
    return NextResponse.json(
      { success: false, error: "Informe um usuário e uma senha válidos." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { success: false, error: "Usuário ou senha incorretos." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(process.env.ADMIN_USERNAME!.trim()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return NextResponse.json(
    { success: true, message: "Acesso autorizado." },
    { headers: { "Cache-Control": "no-store" } }
  );
}

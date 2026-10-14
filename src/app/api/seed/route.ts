import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";
import { isAdminAuthConfigured, isAdminAuthenticated } from "@/lib/admin-auth";

async function requireAdmin() {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: "A autenticação administrativa não está configurada." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Autenticação necessária." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
  return null;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  const result = await seedDatabase();
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  const authError = await requireAdmin();
  if (authError) return authError;
  const result = await seedDatabase();
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

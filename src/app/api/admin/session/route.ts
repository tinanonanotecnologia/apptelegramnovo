import { NextResponse } from "next/server";
import { isAdminAuthConfigured, isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  const configured = isAdminAuthConfigured();
  const authenticated = configured ? await isAdminAuthenticated() : false;

  return NextResponse.json(
    { success: true, configured, authenticated },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

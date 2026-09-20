import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Without Supabase env vars there is no session to refresh; let the page render
  // so error.tsx can show a clear "not configured" message instead of a bare 500.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  // Skip static assets and images; run on every page and API route.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { searchProfiles } from "@/lib/supabase/queries/profiles";

/** Lightweight people search used by client dialogs (add member). */
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const profiles = await searchProfiles({ q }, 10);
  return NextResponse.json({
    profiles: profiles.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      organization: p.organization,
      role: p.role,
      skills: p.skills,
    })),
  });
}

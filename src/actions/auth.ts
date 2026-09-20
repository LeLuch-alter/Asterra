"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { parseForm } from "@/lib/validation/form";
import { publicEnv } from "@/lib/env";
import type { ActionResult } from "@/types";

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(loginSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: "Invalid email or password." };

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/dashboard");
}

export async function signUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(registerSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${publicEnv.siteUrl}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: error.message };

  // With email confirmation disabled (recommended for the demo) a session exists immediately.
  if (data.session) redirect("/profile?welcome=1");
  return { ok: true, data: undefined };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

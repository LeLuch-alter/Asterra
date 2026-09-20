"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";
import { parseForm } from "@/lib/validation/form";
import type { ActionResult } from "@/types";

export async function updateProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const parsed = parseForm(profileSchema, formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath(`/researchers/${user.id}`);
  return { ok: true, data: undefined };
}

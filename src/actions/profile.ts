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

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

/** Uploads an avatar to the public "avatars" bucket and stores its URL on the profile. */
export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image first." };
  if (!ALLOWED.has(file.type)) return { ok: false, error: "Use a PNG, JPEG or WebP image." };
  if (file.size > MAX_AVATAR_BYTES) return { ok: false, error: "The image must be smaller than 2 MB." };

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
  if (uploadError) return { ok: false, error: uploadError.message };

  // Cache-bust so the new picture shows immediately after replacing the old one.
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true, data: { url } };
}

export async function removeAvatar(): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const supabase = await createClient();
  await supabase.storage.from("avatars").remove(["png", "jpg", "webp"].map((e) => `${user.id}/avatar.${e}`));
  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeAvatar, uploadAvatar } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useT } from "@/lib/i18n/provider";

type Props = { name: string; avatarUrl: string | null };

/** Avatar picker with instant preview; uploads to Supabase Storage via a Server Action. */
export function AvatarUpload({ name, avatarUrl }: Props) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [pending, start] = useTransition();

  function onFile(file: File | undefined) {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    const fd = new FormData();
    fd.set("avatar", file);
    start(async () => {
      const res = await uploadAvatar(fd);
      if (!res.ok) {
        toast.error(res.error);
        setPreview(avatarUrl);
      } else {
        toast.success(t("Photo updated"));
        setPreview(res.data.url);
      }
      URL.revokeObjectURL(localUrl);
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar name={name} src={preview} className="size-20 text-xl" />
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
            <Camera />
            {preview ? t("Change photo") : t("Upload photo")}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await removeAvatar();
                  if (!res.ok) toast.error(res.error);
                  else setPreview(null);
                })
              }
            >
              <Trash2 />
              {t("Remove")}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("PNG, JPEG or WebP, up to 2 MB.")}</p>
      </div>
    </div>
  );
}

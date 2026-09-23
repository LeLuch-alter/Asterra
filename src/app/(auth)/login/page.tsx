import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const t = await getT();
  return <LoginForm next={next} initialError={error === "auth" ? t("The sign-in link is invalid or expired.") : undefined} />;
}

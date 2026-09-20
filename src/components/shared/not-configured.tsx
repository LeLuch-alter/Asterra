import { Settings } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "AI_API_KEY (for AI features)"];

/** Shown instead of the app when Supabase environment variables are missing. */
export function NotConfigured() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <Settings className="size-8 text-primary" />
      <h1 className="text-xl font-semibold">Asterra is not configured yet</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Environment variables are missing. Locally, copy <code>.env.example</code> to <code>.env.local</code>. On
        Vercel, open <strong>Settings → Environment Variables</strong>, add them and redeploy.
      </p>
      <ul className="rounded-lg border bg-muted/50 px-4 py-3 text-left font-mono text-xs">
        {REQUIRED.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  );
}

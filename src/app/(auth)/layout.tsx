import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Logo className="mb-8" />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

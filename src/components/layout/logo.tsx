import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className, showText = true }: { href?: string; className?: string; showText?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <Image src="/logo.png" alt="Asterra" width={36} height={36} className="size-9 object-contain" priority />
      {showText && <span className="text-lg">Asterra</span>}
    </Link>
  );
}

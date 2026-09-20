import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/**
 * A styled native <select>. Used inside Server Action forms because it submits
 * its value with FormData without extra client state.
 */
export function NativeSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-xs outline-none",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

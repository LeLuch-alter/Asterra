import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  className?: string;
  children: React.ReactNode;
};

/** Label + control + hint + validation errors, used by every form. */
export function FormField({ label, htmlFor, hint, errors, className, children }: Props) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !errors?.length && <p className="text-xs text-muted-foreground">{hint}</p>}
      {errors?.map((e) => (
        <p key={e} className="text-xs text-destructive">
          {e}
        </p>
      ))}
    </div>
  );
}

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "./native-select";

export type FilterOption = { value: string; label: string };
export type FilterSelect = { name: string; placeholder: string; options: FilterOption[]; value?: string };

type Props = {
  action: string;
  q?: string;
  placeholder?: string;
  selects?: FilterSelect[];
  /** Extra hidden inputs to preserve (e.g. tab). */
  hidden?: Record<string, string>;
};

/**
 * GET form that writes filters into the URL; the page reads searchParams on the server.
 * No client state needed.
 */
export function SearchFilterBar({ action, q, placeholder = "Search…", selects = [], hidden = {} }: Props) {
  return (
    <form action={action} className="mb-6 flex flex-col gap-2 sm:flex-row">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q} placeholder={placeholder} className="pl-8" />
      </div>
      {selects.map((s) => (
        <NativeSelect key={s.name} name={s.name} defaultValue={s.value ?? ""} className="sm:w-48">
          <option value="">{s.placeholder}</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      ))}
      <Button type="submit" variant="secondary">
        Apply
      </Button>
    </form>
  );
}

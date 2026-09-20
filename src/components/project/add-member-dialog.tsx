"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { addMember } from "@/actions/members";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/shared/native-select";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MEMBER_ROLE_LABELS, type Profile } from "@/types";

type Person = Pick<Profile, "id" | "full_name" | "avatar_url" | "organization" | "role" | "skills">;

type Props = {
  projectId: string;
  existingIds: string[];
  /** Pre-select a person (used from AI Match "Add to project"). */
  preselected?: Person;
  trigger?: React.ReactNode;
};

export function AddMemberDialog({ projectId, existingIds, preselected, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("contributor");
  const [pending, start] = useTransition();

  // Debounced people search against /api/researchers.
  useEffect(() => {
    if (!open || preselected) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/researchers?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await res.json()) as { profiles?: Person[] };
        setPeople((data.profiles ?? []).filter((p) => !existingIds.includes(p.id)));
      } catch {
        /* aborted or network error — keep previous list */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q, open, existingIds, preselected]);

  function add(person: Person) {
    start(async () => {
      const res = await addMember(projectId, person.id, role);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${person.full_name} added to the project`);
      setOpen(false);
    });
  }

  const list = preselected ? [preselected] : people;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <UserPlus />
            Add member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a team member</DialogTitle>
          <DialogDescription>Choose a role, then pick a person from Asterra.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <NativeSelect value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
            {Object.entries(MEMBER_ROLE_LABELS)
              .filter(([v]) => v !== "owner")
              .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
          </NativeSelect>

          {!preselected && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or organization"
                className="pl-8"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-72 overflow-y-auto rounded-md border">
            {loading && (
              <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </p>
            )}
            {!loading && list.length === 0 && <p className="p-3 text-sm text-muted-foreground">No people found.</p>}
            {list.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b p-3 last:border-b-0">
                <UserAvatar name={p.full_name} src={p.avatar_url} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.organization || p.role}</p>
                </div>
                <Button size="sm" variant="secondary" disabled={pending} onClick={() => add(p)}>
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

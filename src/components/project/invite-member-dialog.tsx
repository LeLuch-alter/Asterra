"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteToProject } from "@/actions/invitations";
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
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/shared/native-select";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MEMBER_ROLE_LABELS, USER_ROLE_LABELS, type ProfileLite } from "@/types";
import { useT } from "@/lib/i18n/provider";

type Props = {
  projectId: string;
  /** The owner's accepted connections who are not members / not yet invited. */
  candidates: ProfileLite[];
  /** Pre-select a person (used from AI Match). */
  preselected?: ProfileLite;
  trigger?: React.ReactNode;
};

/**
 * Invite a connection to the project. The person receives a notification and
 * becomes a member only after accepting.
 */
export function InviteMemberDialog({ projectId, candidates, preselected, trigger }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("contributor");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  const list = preselected
    ? [preselected]
    : candidates.filter((p) => {
        const s = q.trim().toLowerCase();
        return !s || p.full_name.toLowerCase().includes(s) || p.organization.toLowerCase().includes(s);
      });

  function invite(person: ProfileLite) {
    start(async () => {
      const res = await inviteToProject(projectId, person.id, role, message);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(t("Invitation sent to {name}", { name: person.full_name }));
      setOpen(false);
      setMessage("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <UserPlus />
            {t("Invite")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("Invite to the project")}</DialogTitle>
          <DialogDescription>
            {t("You can invite people from your connections. They join only after accepting the invitation.")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            {!preselected ? (
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search your connections")} className="pl-8" autoFocus />
              </div>
            ) : (
              <div />
            )}
            <NativeSelect value={role} onChange={(e) => setRole(e.target.value)} aria-label={t("Role")} className="sm:w-40">
              {Object.entries(MEMBER_ROLE_LABELS)
                .filter(([v]) => v !== "owner")
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {t(label)}
                  </option>
                ))}
            </NativeSelect>
          </div>

          <Textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("Optional message: what you would like them to work on")}
            maxLength={500}
          />

          <div className="max-h-72 overflow-y-auto rounded-md border">
            {list.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                {candidates.length === 0 && !preselected ? (
                  <>
                    {t("No connections to invite yet.")}{" "}
                    <Link href="/researchers" className="font-medium text-foreground underline-offset-4 hover:underline">
                      {t("Find researchers")}
                    </Link>{" "}
                    {t("and connect with them first.")}
                  </>
                ) : (
                  t("No one matches your search.")
                )}
              </p>
            )}
            {list.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b p-3 last:border-b-0">
                <UserAvatar name={p.full_name} src={p.avatar_url} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.organization || t(USER_ROLE_LABELS[p.role])}</p>
                </div>
                <Button size="sm" variant="secondary" disabled={pending} onClick={() => invite(p)}>
                  {pending && <Loader2 className="animate-spin" />}
                  {t("Invite")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

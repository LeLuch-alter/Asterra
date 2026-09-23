"use client";

import { useTransition } from "react";
import { Check, Clock, Loader2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { acceptConnection, removeConnection, sendConnectionRequest } from "@/actions/connections";
import { Button } from "@/components/ui/button";
import type { ConnectionState } from "@/types";
import type { ComponentProps } from "react";
import { useT } from "@/lib/i18n/provider";

type Props = { otherId: string; state: ConnectionState; size?: ComponentProps<typeof Button>["size"] };

/** Connect / Pending / Accept / Connected button driven by the connection state. */
export function ConnectButton({ otherId, state, size = "sm" }: Props) {
  const t = useT();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) toast.error(res.error ?? t("Something went wrong"));
      else if (success) toast.success(success);
    });
  }

  if (state.kind === "self") return null;
  const spinner = pending ? <Loader2 className="animate-spin" /> : null;

  switch (state.kind) {
    case "none":
      return (
        <Button size={size} disabled={pending} onClick={() => run(() => sendConnectionRequest(otherId), t("Request sent"))}>
          {spinner ?? <UserPlus />}
          {t("Connect")}
        </Button>
      );
    case "outgoing":
      return (
        <Button size={size} variant="outline" disabled={pending} onClick={() => run(() => removeConnection(state.id), t("Request cancelled"))}>
          {spinner ?? <Clock />}
          {t("Pending")}
        </Button>
      );
    case "incoming":
      return (
        <span className="flex gap-1">
          <Button size={size} disabled={pending} onClick={() => run(() => acceptConnection(state.id), t("Connected"))}>
            {spinner ?? <Check />}
            {t("Accept")}
          </Button>
          <Button size={size} variant="ghost" disabled={pending} onClick={() => run(() => removeConnection(state.id))} aria-label={t("Decline")}>
            <X />
          </Button>
        </span>
      );
    case "connected":
      return (
        <Button size={size} variant="outline" disabled={pending} onClick={() => run(() => removeConnection(state.id), t("Connection removed"))} title={t("Remove connection")}>
          {spinner ?? <Check />}
          {t("Connected")}
        </Button>
      );
  }
}

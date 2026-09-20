"use client";

import { useTransition } from "react";
import { Check, Clock, Loader2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { acceptConnection, removeConnection, sendConnectionRequest } from "@/actions/connections";
import { Button } from "@/components/ui/button";
import type { ConnectionState } from "@/types";
import type { ComponentProps } from "react";

type Props = { otherId: string; state: ConnectionState; size?: ComponentProps<typeof Button>["size"] };

/** Connect / Pending / Accept / Connected button driven by the connection state. */
export function ConnectButton({ otherId, state, size = "sm" }: Props) {
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) toast.error(res.error ?? "Something went wrong");
      else if (success) toast.success(success);
    });
  }

  if (state.kind === "self") return null;
  const spinner = pending ? <Loader2 className="animate-spin" /> : null;

  switch (state.kind) {
    case "none":
      return (
        <Button size={size} disabled={pending} onClick={() => run(() => sendConnectionRequest(otherId), "Request sent")}>
          {spinner ?? <UserPlus />}
          Connect
        </Button>
      );
    case "outgoing":
      return (
        <Button size={size} variant="outline" disabled={pending} onClick={() => run(() => removeConnection(state.id), "Request cancelled")}>
          {spinner ?? <Clock />}
          Pending
        </Button>
      );
    case "incoming":
      return (
        <span className="flex gap-1">
          <Button size={size} disabled={pending} onClick={() => run(() => acceptConnection(state.id), "Connected")}>
            {spinner ?? <Check />}
            Accept
          </Button>
          <Button size={size} variant="ghost" disabled={pending} onClick={() => run(() => removeConnection(state.id))} aria-label="Decline">
            <X />
          </Button>
        </span>
      );
    case "connected":
      return (
        <Button size={size} variant="outline" disabled={pending} onClick={() => run(() => removeConnection(state.id), "Connection removed")} title="Remove connection">
          {spinner ?? <Check />}
          Connected
        </Button>
      );
  }
}

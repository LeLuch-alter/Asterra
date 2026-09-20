"use client";

import { useState, useTransition } from "react";
import { Clock, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { cancelJoinRequest, requestToJoin } from "@/actions/join-requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { JoinRequestStatus } from "@/types";

type Props = { projectId: string; projectTitle: string; existing: JoinRequestStatus | null };

/** "Request to join" for non-members; shows pending state and lets the user cancel. */
export function JoinRequestButton({ projectId, projectTitle, existing }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  if (existing === "pending") {
    return (
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await cancelJoinRequest(projectId);
            if (!res.ok) toast.error(res.error);
            else toast.success("Request cancelled");
          })
        }
      >
        {pending ? <Loader2 className="animate-spin" /> : <Clock />}
        Request pending
      </Button>
    );
  }

  if (existing === "declined") {
    return (
      <Button variant="outline" disabled>
        Request declined
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send />
          Request to join
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join “{projectTitle}”</DialogTitle>
          <DialogDescription>Tell the project owner briefly why you want to join and what you can contribute.</DialogDescription>
        </DialogHeader>
        <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I have experience with…" maxLength={500} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await requestToJoin(projectId, message);
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Request sent to the project owner");
                setOpen(false);
              })
            }
          >
            {pending && <Loader2 className="animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markThreadRead, sendMessage } from "@/actions/messages";
import { formatDate } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

type Props = {
  me: string;
  other: { id: string; full_name: string };
  messages: Message[];
  /** Only connections can exchange messages — mirrors the database policy. */
  canMessage: boolean;
};

export function MessageThread({ me, other, messages, canMessage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Opening the thread clears its unread badge.
  const hasUnread = messages.some((m) => m.recipient_id === me && !m.read_at);
  useEffect(() => {
    if (hasUnread) void markThreadRead(other.id);
  }, [hasUnread, other.id]);

  function send() {
    const text = body.trim();
    if (!text || pending) return;
    startTransition(async () => {
      const result = await sendMessage(other.id, text);
      if (result.ok) setBody("");
      else toast.error(result.error);
    });
  }

  return (
    <div className="flex min-h-[60vh] flex-col rounded-xl border bg-card">
      <ol className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            {t("No messages yet. Say hello to {name}.", { name: other.full_name })}
          </li>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === me;
          return (
            <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2",
                  mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                <time
                  dateTime={m.created_at}
                  className={cn("mt-1 block text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}
                >
                  {formatDate(m.created_at, { dateStyle: "short", timeStyle: "short" }, locale)}
                </time>
              </div>
            </li>
          );
        })}
        <div ref={endRef} />
      </ol>

      <div className="border-t p-3">
        {canMessage ? (
          <div className="flex items-end gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t("Message {name}…", { name: other.full_name })}
              rows={2}
              maxLength={4000}
              className="min-h-[44px] resize-none"
              aria-label={t("Message")}
            />
            <Button onClick={send} disabled={pending || body.trim().length === 0} size="icon" aria-label={t("Send")}>
              <SendHorizontal />
            </Button>
          </div>
        ) : (
          <p className="py-2 text-center text-sm text-muted-foreground">
            {t("You can only message researchers you are connected with.")}
          </p>
        )}
      </div>
    </div>
  );
}

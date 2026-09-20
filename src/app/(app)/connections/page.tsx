import Link from "next/link";
import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ConnectButton } from "@/components/researcher/connect-button";
import { requireUser } from "@/lib/supabase/server";
import { getMyConnections, type ConnectionWithProfile } from "@/lib/supabase/queries/social";
import { USER_ROLE_LABELS, type ConnectionState } from "@/types";

export const metadata: Metadata = { title: "Connections" };

function PersonRow({ c, state }: { c: ConnectionWithProfile; state: ConnectionState }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <UserAvatar name={c.profile.full_name} src={c.profile.avatar_url} className="size-10" />
      <div className="min-w-0 flex-1">
        <Link href={`/researchers/${c.profile.id}`} className="font-medium hover:underline">
          {c.profile.full_name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {USER_ROLE_LABELS[c.profile.role]}
          {c.profile.organization && ` · ${c.profile.organization}`}
        </p>
      </div>
      <ConnectButton otherId={c.profile.id} state={state} />
    </li>
  );
}

export default async function ConnectionsPage() {
  const user = await requireUser();
  const { accepted, incoming, outgoing } = await getMyConnections(user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Your network"
        title="Connections"
        description="People you work with. Connect with researchers to build your team faster."
        actions={
          <Button asChild variant="outline">
            <Link href="/researchers">Find people</Link>
          </Button>
        }
      />

      {incoming.length > 0 && (
        <section className="mb-8">
          <p className="eyebrow eyebrow-accent mb-1">Requests · {incoming.length}</p>
          <ul className="divide-y rounded-xl border border-primary/30 bg-card px-4">
            {incoming.map((c) => (
              <PersonRow key={c.id} c={c} state={{ kind: "incoming", id: c.id }} />
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8">
        <p className="eyebrow mb-1">Connected · {accepted.length}</p>
        {accepted.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="No connections yet"
            description="Search for researchers and mentors and send a connection request."
            action={
              <Button asChild>
                <Link href="/researchers">Browse researchers</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y rounded-xl border bg-card px-4">
            {accepted.map((c) => (
              <PersonRow key={c.id} c={c} state={{ kind: "connected", id: c.id }} />
            ))}
          </ul>
        )}
      </section>

      {outgoing.length > 0 && (
        <section>
          <p className="eyebrow mb-1">Sent · {outgoing.length}</p>
          <ul className="divide-y rounded-xl border bg-card px-4">
            {outgoing.map((c) => (
              <PersonRow key={c.id} c={c} state={{ kind: "outgoing", id: c.id }} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

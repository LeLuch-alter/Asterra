import Link from "next/link";
import { ArrowRight, Compass, Map, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { getUser } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { NotConfigured } from "@/components/shared/not-configured";

const FEATURES = [
  {
    icon: Map,
    title: "AI Research Roadmap",
    text: "Turn a project idea into an editable plan: question, hypothesis, literature, methods, analysis, results.",
  },
  {
    icon: Users,
    title: "AI Match",
    text: "Find collaborators and mentors whose fields, skills and experience fit your project — with an explanation why.",
  },
  {
    icon: Sparkles,
    title: "AI Research Assistant",
    text: "Summarize, explain, review structure and suggest improvements for your research notes.",
  },
  {
    icon: Compass,
    title: "Discover",
    text: "Search projects and researchers by field and skills, follow science news, and grow your team.",
  },
];

export default async function HomePage() {
  if (!publicEnv.supabaseConfigured) return <NotConfigured />;
  const user = await getUser();

  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="size-3.5" />
            GitHub for science, with AI built in
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Plan, share and improve research together
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Asterra is a collaboration platform where students, researchers and mentors create research projects,
            find the right people and use AI to plan and refine their work.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={user ? "/dashboard" : "/register"}>
                {user ? "Open dashboard" : "Create an account"}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={user ? "/projects" : "/login"}>{user ? "Browse projects" : "Sign in"}</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardContent className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Asterra — student demonstration project. AI output is assistance, not scientific validation.
      </footer>
    </>
  );
}

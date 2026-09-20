# ARCHITECTURE.md

Working name: **Asterra** — AI-powered scientific collaboration platform (student demo).

This document is the single place that answers: *where does each piece of code live, where do the APIs live, and how does data flow.* It complements `CLAUDE.md` (rules), `INSTRUMENTS.md` (stack) and `ROADMAP.md` (phases).

---

## 1. High-level picture

```text
Browser (React, shadcn/ui, Tailwind)
   |
   |  HTML / RSC payload / fetch
   v
Next.js App Router (Vercel)
   |
   +-- Server Components ........ read data (Supabase, server-side)
   +-- Server Actions ........... mutations: auth, profiles, projects, results, roadmap, members
   +-- Route Handlers (/api/*) .. AI features + science news (external APIs)
   |
   +-- src/lib/supabase ......... Postgres + Auth + Storage (RLS on)
   +-- src/lib/ai ............... Gemini | OpenAI behind one provider interface (server-only)
   +-- src/lib/news ............. RSS/news fetch + fallback demo data
```

One deployable unit. No separate backend, no microservices.

---

## 2. Folder structure

```text
Asterra/
├── CLAUDE.md, INSTRUMENTS.md, ROADMAP.md, ARCHITECTURE.md
├── design-image/                  # supplied design references (visual source of truth)
├── .env.example                   # template of all env vars (committed)
├── .env.local                     # real keys (git-ignored, never committed)
├── .gitignore
├── package.json, next.config.ts, tsconfig.json, tailwind.config.ts, components.json
├── public/                        # static assets (logo, og image, demo avatars)
│
├── supabase/
│   ├── migrations/                # SQL migrations, numbered: 0001_init.sql, 0002_rls.sql ...
│   └── seed.sql                   # demo users / projects / news for a reliable demo
│
└── src/
    ├── proxy.ts                   # Next 16 "proxy" (ex-middleware): refresh Supabase session, redirect guests
    │
    ├── app/                       # ROUTES ONLY — thin pages that compose components
    │   ├── layout.tsx             # root layout (fonts, theme, toaster)
    │   ├── page.tsx               # landing / home
    │   ├── globals.css
    │   │
    │   ├── (auth)/                # public auth pages, minimal layout
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   │
    │   ├── (app)/                 # protected area, shared app shell (sidebar / topbar)
    │   │   ├── layout.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── projects/
    │   │   │   ├── page.tsx                 # discovery + search + filters
    │   │   │   ├── new/page.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx             # overview (question, hypothesis, methodology)
    │   │   │       ├── edit/page.tsx
    │   │   │       ├── team/page.tsx        # members + roles
    │   │   │       ├── results/page.tsx     # research results / notes
    │   │   │       ├── roadmap/page.tsx     # AI Research Roadmap (editable)
    │   │   │       ├── match/page.tsx       # AI Match
    │   │   │       └── assistant/page.tsx   # AI Research Assistant
    │   │   ├── researchers/
    │   │   │   ├── page.tsx                 # researcher / mentor discovery
    │   │   │   └── [id]/page.tsx            # public researcher profile
    │   │   ├── profile/page.tsx             # edit own profile
    │   │   ├── news/page.tsx
    │   │   └── notifications/page.tsx
    │   │
    │   ├── auth/callback/route.ts # Supabase email-confirm / OAuth code exchange
    │   │
    │   └── api/                   # ROUTE HANDLERS (see section 3)
    │       ├── _lib/ai-route.ts   # shared guard (auth + membership) and AI error mapping
    │       ├── ai/
    │       │   ├── match/route.ts
    │       │   ├── assistant/route.ts
    │       │   └── roadmap/route.ts
    │       ├── news/route.ts
    │       └── researchers/route.ts  # people search for client dialogs (add member)
    │
    ├── actions/                   # SERVER ACTIONS ("use server") — all DB mutations
    │   ├── auth.ts                # signIn, signUp, signOut
    │   ├── profile.ts             # upsertProfile, uploadAvatar
    │   ├── projects.ts            # createProject, updateProject, archiveProject
    │   ├── members.ts             # addMember, removeMember, changeRole
    │   ├── results.ts             # createResult, updateResult, deleteResult
    │   ├── roadmap.ts             # saveRoadmap, updateItem, reorderItems, deleteItem
    │   └── notifications.ts       # markRead
    │
    ├── components/
    │   ├── ui/                    # shadcn/ui primitives (generated, radix-nova style)
    │   ├── layout/                # AppShell, Sidebar, Topbar, Footer, PageHeader
    │   ├── auth/                  # LoginForm, RegisterForm
    │   ├── project/               # ProjectCard, ProjectForm, ProjectHeader, MemberList, ResultCard, ResultForm
    │   ├── researcher/            # ResearcherCard, ProfileForm, SkillBadges
    │   ├── ai/                    # RoadmapEditor, MatchResultCard, AssistantPanel, AiDisclaimer
    │   ├── news/                  # NewsCard, NewsCategoryTabs
    │   └── shared/                # SearchBar, FilterBar, EmptyState, LoadingState, ErrorState
    │
    ├── lib/
    │   ├── env.ts                 # typed access to env vars; secrets never re-exported to client
    │   ├── supabase/
    │   │   ├── client.ts          # browser client (anon key)
    │   │   ├── server.ts          # server client (cookies) for RSC / actions / route handlers
    │   │   ├── proxy.ts           # session refresh helper used by src/proxy.ts
    │   │   ├── queries/project-context.ts  # project + current user role, cached per request
    │   │   └── queries/           # typed READ helpers, one file per entity
    │   │       ├── profiles.ts
    │   │       ├── projects.ts
    │   │       ├── results.ts
    │   │       ├── roadmap.ts
    │   │       └── notifications.ts
    │   ├── ai/                    # ALL AI logic, server-only
    │   │   ├── provider.ts        # interface AiProvider + factory by env
    │   │   ├── providers/
    │   │   │   ├── gemini.ts
    │   │   │   └── openai.ts
    │   │   ├── schemas.ts         # zod schemas for every AI response (validate before use)
    │   │   ├── prompts/           # prompt templates as plain functions
    │   │   ├── match.ts           # buildMatchInput -> provider -> validate -> MatchResult[]
    │   │   ├── research-assistant.ts
    │   │   └── roadmap.ts
    │   ├── news/
    │   │   ├── fetch-news.ts      # RSS fetch + parse + category mapping, cached
    │   │   └── fallback-news.ts   # seeded demo items used when the feed fails
    │   ├── validation/            # zod schemas for forms / actions + parseForm(FormData)
    │   ├── utils.ts               # cn() (shadcn)
    │   └── format.ts              # formatDate(), timeAgo()
    │
    └── types/
        ├── database.ts            # generated: `supabase gen types typescript`
        └── index.ts               # app-level types (Project, Profile, RoadmapItem, MatchResult ...)
```

Rules of thumb:

- `app/` contains routing and page composition only. Business logic lives in `actions/` and `lib/`.
- Reads go through `lib/supabase/queries/*` from Server Components. Writes go through `actions/*`.
- The client never imports `lib/ai`, `lib/news` or server secrets from `lib/env`. Mark those files with `import "server-only"`.

---

## 3. Where the APIs live

### 3.1 Internal API surface

| Concern | Mechanism | Location | Why |
|---|---|---|---|
| Auth (sign up / in / out) | Server Action | `src/actions/auth.ts` | form-driven, redirects |
| Profile CRUD | Server Action | `src/actions/profile.ts` | simple mutation + revalidate |
| Project CRUD, members | Server Action | `src/actions/projects.ts`, `members.ts` | ownership check + RLS |
| Research results CRUD | Server Action | `src/actions/results.ts` | same |
| Roadmap item edits | Server Action | `src/actions/roadmap.ts` | many small mutations |
| **AI Match** | Route Handler `POST /api/ai/match` | `src/app/api/ai/match/route.ts` | long-running, JSON in/out, loading UI, easy to stream later |
| **AI Research Assistant** | Route Handler `POST /api/ai/assistant` | `src/app/api/ai/assistant/route.ts` | same |
| **AI Research Roadmap** | Route Handler `POST /api/ai/roadmap` | `src/app/api/ai/roadmap/route.ts` | generate -> return draft -> user saves via action |
| Science news | Route Handler `GET /api/news?category=` | `src/app/api/news/route.ts` | external fetch, cacheable, fallback |
| People search (dialogs) | Route Handler `GET /api/researchers?q=` | `src/app/api/researchers/route.ts` | client-side typeahead needs JSON |
| Auth callback | Route Handler `GET /auth/callback` | `src/app/auth/callback/route.ts` | Supabase code exchange |

Route handlers are thin: **auth check -> zod-validate body -> call `lib/ai/*` or `lib/news/*` -> return JSON**. They contain no prompts and no provider code.

### 3.2 External APIs and their keys

| External service | Used from | Env var(s) | Exposed to browser? |
|---|---|---|---|
| Supabase (DB, Auth, Storage) | `lib/supabase/client.ts`, `server.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes (anon key is safe with RLS) |
| Supabase service role (optional, seed/admin scripts only) | scripts only | `SUPABASE_SERVICE_ROLE_KEY` | **never** |
| Gemini API *or* OpenAI API | `lib/ai/providers/*` only | `AI_PROVIDER=gemini\|openai`, `AI_API_KEY`, `AI_MODEL` | **never** |
| Science news (RSS, no key) or NewsAPI | `lib/news/fetch-news.ts` only | `NEWS_FEED_URLS`, optional `NEWS_API_KEY` | **never** |
| App URL for auth redirects | `actions/auth.ts` | `NEXT_PUBLIC_SITE_URL` | yes |

Where the keys physically go:

- **Local development:** `.env.local` in the project root (git-ignored).
- **Production:** Vercel -> Project -> Settings -> Environment Variables.
- **Template:** `.env.example` (committed, placeholder values only).

`src/lib/env.ts` is the only module that reads `process.env`. Everything else imports from it. That gives one place to validate that required vars exist at boot.

### 3.3 AI provider contract

```ts
// src/lib/ai/provider.ts (shape only)
export interface AiProvider {
  generateJson<T>(opts: { system: string; prompt: string; schema: ZodSchema<T> }): Promise<T>;
}
export function getAiProvider(): AiProvider; // picks gemini/openai from env.AI_PROVIDER
```

`match.ts`, `research-assistant.ts`, `roadmap.ts` depend only on this interface. Swapping Gemini -> OpenAI touches one file in `providers/` and one env var.

Every AI response is parsed with a zod schema from `schemas.ts` before it reaches the UI. Invalid output -> typed error -> `ErrorState` in the UI, never a crash.

---

## 4. Data model (Supabase / Postgres)

```text
profiles                (id = auth.users.id, full_name, avatar_url, bio, organization,
                         role: student|researcher|mentor, research_fields text[], skills text[],
                         interests text[], experience_years, is_mentor bool, created_at)
projects                (id, owner_id -> profiles, title, description, research_field,
                         research_question, hypothesis, methodology, status, visibility,
                         required_skills text[], created_at, updated_at)
project_members         (project_id, user_id, role: owner|researcher|mentor|contributor, joined_at)
research_results        (id, project_id, author_id, title, content, created_at, updated_at)
research_roadmap_items  (id, project_id, title, description, position, status, created_at)
match_results           (id, project_id, candidate_id, score, reasons jsonb, created_at)
news_items              (id, title, summary, url, source, category, published_at)   -- cache/fallback
notifications           (id, user_id, type, payload jsonb, read_at, created_at)
```

- Migrations in `supabase/migrations/`, seed in `supabase/seed.sql`.
- RLS: profiles readable by all authenticated users; projects readable if public or member; writable only by owner/members according to role; results/roadmap follow project membership.
- Indexes: `projects(research_field)`, `projects(status)`, GIN on `profiles.skills`, `profiles.research_fields`, `projects.required_skills`; full-text on `projects(title, description)`.

---

## 5. Feature data flows

**AI Roadmap**
`roadmap/page.tsx` -> `POST /api/ai/roadmap {projectId}` -> handler loads project -> `lib/ai/roadmap.generate()` -> zod validate -> JSON back -> `RoadmapEditor` shows draft -> user clicks Save -> `actions/roadmap.saveRoadmap()` -> `research_roadmap_items`.

**AI Match**
`match/page.tsx` -> `POST /api/ai/match {projectId}` -> handler loads project + candidate profiles (SQL pre-filter by field/skills overlap, exclude members) -> `lib/ai/match.rank()` -> validate -> JSON with reasons -> `MatchResultCard` list (+ "Request to connect" -> `actions/members` / notification).

**AI Assistant**
`AssistantPanel` (client) -> `POST /api/ai/assistant {projectId, resultId?, operation: summarize|explain|review|suggest_questions|improve, selection?}` -> handler loads context -> `lib/ai/research-assistant.run()` -> validate -> JSON -> panel renders, labelled "AI assistance".

**News**
`news/page.tsx` (server) -> `lib/news/fetch-news.ts` with `revalidate` cache -> on failure -> `fallback-news.ts`. `/api/news` exists for client-side category switching.

---

## 6. Implementation notes

- Next.js 16: `middleware.ts` is now `proxy.ts`; `params` / `searchParams` are Promises; see `AGENTS.md` (auto-generated by `next dev`).
- Forms use Server Actions + `useActionState`; `<NativeSelect>` is used inside those forms so values submit via FormData without client state.
- OpenAI is called through plain `fetch` (JSON mode) — no extra SDK; Gemini uses `@google/genai` with `responseJsonSchema`.
- Setup and deployment steps: see `README.md`.

---

## 7. Open items before coding

- [x] Phases 0-9 implemented with a simple placeholder design (to be replaced by the supplied design images).
- [ ] `design-image/` has only `logo.png` — full screen designs are needed for the visual redesign.
- [ ] Put real keys into `.env.local` (see `.env.example`) and run the SQL in `supabase/`.
- [ ] `git init` + GitHub repo + Vercel.

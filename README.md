# Asterra

AI-powered scientific collaboration platform — a student demonstration project.
"GitHub for science": create research projects, collaborate, discover researchers and mentors, and use AI to plan and improve research.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase · Gemini/OpenAI · Vercel.

Docs: [ARCHITECTURE.md](ARCHITECTURE.md) · [ROADMAP.md](ROADMAP.md) · [INSTRUMENTS.md](INSTRUMENTS.md) · [CLAUDE.md](CLAUDE.md)

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Where to get it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key | yes |
| `AI_PROVIDER` | `gemini` (default) or `openai` | no |
| `AI_API_KEY` | Google AI Studio or OpenAI dashboard | for AI features |
| `AI_MODEL` | e.g. `gemini-3.6-flash`, `gpt-4o-mini` | no |
| `NEWS_API_KEY` | newsapi.org (free tier, ~100 req/day) | no |
| `NEWS_FEED_URLS` | comma-separated RSS feeds; nothing configured = demo news | no |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your Vercel URL in prod | no |

Without `AI_API_KEY` the app runs, and the AI buttons are disabled with a hint.

## 2. Supabase setup

1. Create a project at supabase.com.
2. **Authentication → Providers → Email**: turn **off** "Confirm email" for a smooth demo (otherwise users must click a confirmation link).
3. **SQL editor**: run `supabase/migrations/0001_init.sql`.
4. **SQL editor**: run `supabase/seed.sql` for demo data. (If demo accounts were created with an older seed and login fails with "Database error querying schema", run `supabase/fix_demo_users.sql` once.) Demo accounts (password `demo1234`):
   - `aigerim@demo.asterra` — student, owner of the water-pollution project
   - `daniyar@demo.asterra` — hydrologist, mentor
   - `elena@demo.asterra` — molecular biologist, mentor
   - `marat@demo.asterra` — physics student
   - `sofia@demo.asterra` — data scientist, mentor
   - `timur@demo.asterra` — biology student
5. (Optional) regenerate DB types: `npx supabase gen types typescript --project-id <ref> > src/types/database.ts`

## 3. Deploy to Vercel

1. Push the repo to GitHub, import it in Vercel.
2. Add the same environment variables in Vercel → Settings → Environment Variables.
3. Set `NEXT_PUBLIC_SITE_URL` to the Vercel URL and add `https://<your-app>.vercel.app/auth/callback` to Supabase → Authentication → URL Configuration → Redirect URLs.

## 4. Scripts

```bash
npm run dev     # dev server
npm run build   # production build (also type-checks)
npm run lint    # eslint
npx tsc --noEmit
```

## 5. Demo flow

Register → complete profile → create project → **Roadmap** tab: generate with AI, edit, save → **AI Match**: find collaborators, add one → **Results**: add a research note → **AI Assistant**: summarize / review it → **Science news** → project is discoverable on **Projects**.

AI output is always labelled as assistance, not scientific validation.

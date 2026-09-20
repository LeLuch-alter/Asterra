-- Asterra — initial schema
-- Run in Supabase SQL editor or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('student', 'researcher', 'mentor');
create type public.project_status as enum ('idea', 'planning', 'in_progress', 'completed', 'archived');
create type public.project_visibility as enum ('public', 'private');
create type public.member_role as enum ('owner', 'researcher', 'mentor', 'contributor');
create type public.roadmap_status as enum ('todo', 'in_progress', 'done');

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  bio text not null default '',
  organization text not null default '',
  role public.user_role not null default 'student',
  research_fields text[] not null default '{}',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  experience_years int not null default 0 check (experience_years >= 0),
  is_mentor boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_research_fields_idx on public.profiles using gin (research_fields);
create index profiles_skills_idx on public.profiles using gin (skills);
create index profiles_is_mentor_idx on public.profiles (is_mentor);

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  description text not null default '',
  research_field text not null default '',
  research_question text not null default '',
  hypothesis text not null default '',
  methodology text not null default '',
  required_skills text[] not null default '{}',
  status public.project_status not null default 'idea',
  visibility public.project_visibility not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_idx on public.projects (owner_id);
create index projects_field_idx on public.projects (research_field);
create index projects_status_idx on public.projects (status);
create index projects_required_skills_idx on public.projects using gin (required_skills);
create index projects_search_idx on public.projects
  using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- ---------------------------------------------------------------------------
-- project_members
-- ---------------------------------------------------------------------------
create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'contributor',
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index project_members_user_idx on public.project_members (user_id);

-- Owner is always a member.
create or replace function public.handle_new_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute function public.handle_new_project();

-- ---------------------------------------------------------------------------
-- research_results
-- ---------------------------------------------------------------------------
create table public.research_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index research_results_project_idx on public.research_results (project_id, created_at desc);

-- ---------------------------------------------------------------------------
-- research_roadmap_items
-- ---------------------------------------------------------------------------
create table public.research_roadmap_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  position int not null default 0,
  status public.roadmap_status not null default 'todo',
  created_at timestamptz not null default now()
);

create index roadmap_items_project_idx on public.research_roadmap_items (project_id, position);

-- ---------------------------------------------------------------------------
-- match_results (cache of AI Match output)
-- ---------------------------------------------------------------------------
create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  score int not null check (score between 0 and 100),
  reasons jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, candidate_id)
);

-- ---------------------------------------------------------------------------
-- news_items (cache / fallback for science news)
-- ---------------------------------------------------------------------------
create table public.news_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  url text not null unique,
  source text not null default '',
  category text not null default 'General',
  image_url text,
  published_at timestamptz not null default now()
);

create index news_items_category_idx on public.news_items (category, published_at desc);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger research_results_set_updated_at before update on public.research_results
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper: membership check (security definer avoids RLS recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_project_owner(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.projects
    where id = p_project_id and owner_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.research_results enable row level security;
alter table public.research_roadmap_items enable row level security;
alter table public.match_results enable row level security;
alter table public.news_items enable row level security;
alter table public.notifications enable row level security;

-- profiles: everyone signed in can read; only the owner can edit.
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- projects: public ones visible to all signed-in users, private ones to members.
create policy "projects_select" on public.projects
  for select to authenticated
  using (visibility = 'public' or public.is_project_member(id));
create policy "projects_insert_own" on public.projects
  for insert to authenticated with check (auth.uid() = owner_id);
create policy "projects_update_members" on public.projects
  for update to authenticated
  using (public.is_project_member(id)) with check (public.is_project_member(id));
create policy "projects_delete_owner" on public.projects
  for delete to authenticated using (auth.uid() = owner_id);

-- project_members: visible with the project; managed by the owner.
create policy "members_select" on public.project_members
  for select to authenticated
  using (
    public.is_project_member(project_id)
    or exists (select 1 from public.projects p where p.id = project_id and p.visibility = 'public')
  );
create policy "members_insert_owner" on public.project_members
  for insert to authenticated with check (public.is_project_owner(project_id));
create policy "members_update_owner" on public.project_members
  for update to authenticated using (public.is_project_owner(project_id));
create policy "members_delete_owner_or_self" on public.project_members
  for delete to authenticated
  using (public.is_project_owner(project_id) or user_id = auth.uid());

-- research_results: follow project visibility for reads; members write.
create policy "results_select" on public.research_results
  for select to authenticated
  using (
    public.is_project_member(project_id)
    or exists (select 1 from public.projects p where p.id = project_id and p.visibility = 'public')
  );
create policy "results_insert_member" on public.research_results
  for insert to authenticated
  with check (public.is_project_member(project_id) and author_id = auth.uid());
create policy "results_update_author_or_owner" on public.research_results
  for update to authenticated
  using (author_id = auth.uid() or public.is_project_owner(project_id));
create policy "results_delete_author_or_owner" on public.research_results
  for delete to authenticated
  using (author_id = auth.uid() or public.is_project_owner(project_id));

-- roadmap: same as results, any member can edit.
create policy "roadmap_select" on public.research_roadmap_items
  for select to authenticated
  using (
    public.is_project_member(project_id)
    or exists (select 1 from public.projects p where p.id = project_id and p.visibility = 'public')
  );
create policy "roadmap_write_member" on public.research_roadmap_items
  for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- match_results: members only.
create policy "match_member" on public.match_results
  for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- news: read-only for signed-in users (written by server/seed).
create policy "news_select" on public.news_items
  for select to authenticated using (true);

-- notifications: own only.
create policy "notifications_own" on public.notifications
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

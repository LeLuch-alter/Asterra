-- Asterra — "research as a living graph": experiments, scientific sources with links,
-- version history of research ideas, project timeline and research forks.
-- Run AFTER 0003_invitations.sql.

-- ---------------------------------------------------------------------------
-- Forks: a project can branch from another project
-- ---------------------------------------------------------------------------
alter table public.projects
  add column if not exists forked_from uuid references public.projects (id) on delete set null;

create index if not exists projects_forked_from_idx on public.projects (forked_from);

-- ---------------------------------------------------------------------------
-- experiments
-- ---------------------------------------------------------------------------
create type public.experiment_status as enum ('planned', 'running', 'done', 'failed');

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  purpose text not null default '',
  methodology text not null default '',
  data_description text not null default '',
  outcome text not null default '',
  status public.experiment_status not null default 'planned',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index experiments_project_idx on public.experiments (project_id, position);

-- A result can be the outcome of a specific experiment.
alter table public.research_results
  add column if not exists experiment_id uuid references public.experiments (id) on delete set null;

create index if not exists research_results_experiment_idx on public.research_results (experiment_id);

-- ---------------------------------------------------------------------------
-- research_sources: papers/datasets attached to a specific part of the research
-- ---------------------------------------------------------------------------
create type public.source_target as enum (
  'project', 'research_question', 'hypothesis', 'methodology', 'experiment', 'result', 'roadmap_item'
);

create table public.research_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  added_by uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  authors text not null default '',
  year int check (year is null or year between 1500 and 2200),
  url text not null default '',
  note text not null default '',
  /* Which part of the research this source supports. */
  target_type public.source_target not null default 'project',
  /* Set for 'experiment', 'result' and 'roadmap_item' targets. */
  target_id uuid,
  created_at timestamptz not null default now()
);

create index research_sources_project_idx on public.research_sources (project_id, created_at desc);
create index research_sources_target_idx on public.research_sources (target_type, target_id);

-- ---------------------------------------------------------------------------
-- research_versions: history of the core research ideas
-- ---------------------------------------------------------------------------
create type public.research_field_name as enum ('title', 'research_question', 'hypothesis', 'methodology');

create table public.research_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  field public.research_field_name not null,
  version int not null,
  content text not null default '',
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (project_id, field, version)
);

create index research_versions_project_idx on public.research_versions (project_id, field, version desc);

-- ---------------------------------------------------------------------------
-- project_activity: the research timeline
-- ---------------------------------------------------------------------------
create table public.project_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index project_activity_project_idx on public.project_activity (project_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers that keep the timeline and version history filled automatically
-- ---------------------------------------------------------------------------
create or replace function public.log_activity(p_project_id uuid, p_type text, p_payload jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.project_activity (project_id, actor_id, type, payload)
  values (p_project_id, auth.uid(), p_type, coalesce(p_payload, '{}'::jsonb));
$$;

-- Project created: first versions + timeline entry
create or replace function public.on_project_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.research_versions (project_id, field, version, content, author_id)
  values
    (new.id, 'title', 1, new.title, new.owner_id),
    (new.id, 'research_question', 1, new.research_question, new.owner_id),
    (new.id, 'hypothesis', 1, new.hypothesis, new.owner_id),
    (new.id, 'methodology', 1, new.methodology, new.owner_id);

  perform public.log_activity(
    new.id,
    case when new.forked_from is null then 'project_created' else 'project_forked' end,
    jsonb_build_object('title', new.title, 'forked_from', new.forked_from)
  );
  return new;
end;
$$;

create trigger on_project_created_graph
  after insert on public.projects
  for each row execute function public.on_project_created();

-- Core idea changed: store a new version + timeline entry
create or replace function public.on_project_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  f text;
  old_value text;
  new_value text;
  next_version int;
begin
  foreach f in array array['title', 'research_question', 'hypothesis', 'methodology'] loop
    execute format('select ($1).%I, ($2).%I', f, f) into old_value, new_value using old, new;
    if coalesce(old_value, '') is distinct from coalesce(new_value, '') then
      select coalesce(max(version), 0) + 1 into next_version
      from public.research_versions where project_id = new.id and field = f::public.research_field_name;

      insert into public.research_versions (project_id, field, version, content, author_id)
      values (new.id, f::public.research_field_name, next_version, coalesce(new_value, ''), auth.uid());

      perform public.log_activity(new.id, 'idea_updated', jsonb_build_object('field', f, 'version', next_version));
    end if;
  end loop;

  if old.status is distinct from new.status then
    perform public.log_activity(new.id, 'status_changed', jsonb_build_object('status', new.status));
  end if;
  return new;
end;
$$;

create trigger on_project_updated_graph
  after update on public.projects
  for each row execute function public.on_project_updated();

-- Member / result / experiment / source / roadmap events
create or replace function public.on_member_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_name text;
begin
  select full_name into member_name from public.profiles where id = new.user_id;
  perform public.log_activity(
    new.project_id, 'member_joined',
    jsonb_build_object('user_id', new.user_id, 'name', coalesce(member_name, 'A researcher'), 'role', new.role)
  );
  return new;
end;
$$;

create trigger on_member_added_graph
  after insert on public.project_members
  for each row execute function public.on_member_added();

create or replace function public.on_result_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity(new.project_id, 'result_added', jsonb_build_object('id', new.id, 'title', new.title));
  return new;
end;
$$;

create trigger on_result_added_graph
  after insert on public.research_results
  for each row execute function public.on_result_added();

create or replace function public.on_experiment_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity(new.project_id, 'experiment_added', jsonb_build_object('id', new.id, 'title', new.title));
  return new;
end;
$$;

create trigger on_experiment_added_graph
  after insert on public.experiments
  for each row execute function public.on_experiment_added();

create or replace function public.on_source_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity(
    new.project_id, 'source_added',
    jsonb_build_object('id', new.id, 'title', new.title, 'target', new.target_type)
  );
  return new;
end;
$$;

create trigger on_source_added_graph
  after insert on public.research_sources
  for each row execute function public.on_source_added();

-- updated_at on experiments
create trigger experiments_set_updated_at before update on public.experiments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Fork: copy the research idea into a new project owned by the caller
-- ---------------------------------------------------------------------------
create or replace function public.fork_project(p_project_id uuid, p_title text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  src public.projects%rowtype;
  new_id uuid;
begin
  select * into src from public.projects where id = p_project_id;
  if not found then
    raise exception 'Project not found';
  end if;
  -- Only projects the caller may read can be forked.
  if src.visibility <> 'public' and not public.is_project_member(p_project_id) then
    raise exception 'This project is private';
  end if;
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;

  insert into public.projects (
    owner_id, title, description, research_field, research_question, hypothesis, methodology,
    required_skills, status, visibility, forked_from
  ) values (
    auth.uid(),
    coalesce(nullif(trim(p_title), ''), src.title || ' — fork'),
    src.description, src.research_field, src.research_question, src.hypothesis, src.methodology,
    src.required_skills, 'idea', 'public', src.id
  ) returning id into new_id;

  -- Inherit the roadmap as a starting point.
  insert into public.research_roadmap_items (project_id, title, description, position, status)
  select new_id, title, description, position, 'todo'
  from public.research_roadmap_items where project_id = src.id;

  perform public.log_activity(src.id, 'project_forked_by', jsonb_build_object('new_project_id', new_id));
  return new_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.experiments enable row level security;
alter table public.research_sources enable row level security;
alter table public.research_versions enable row level security;
alter table public.project_activity enable row level security;

-- Visible with the project (public project or member); written by members.
create policy "experiments_select" on public.experiments
  for select to authenticated
  using (
    public.is_project_member(project_id)
    or exists (select 1 from public.projects p where p.id = project_id and p.visibility = 'public')
  );
create policy "experiments_write_member" on public.experiments
  for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

create policy "sources_select" on public.research_sources
  for select to authenticated
  using (
    public.is_project_member(project_id)
    or exists (select 1 from public.projects p where p.id = project_id and p.visibility = 'public')
  );
create policy "sources_write_member" on public.research_sources
  for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- History and timeline are read-only for users; rows are written by triggers.
create policy "versions_select" on public.research_versions
  for select to authenticated
  using (
    public.is_project_member(project_id)
    or exists (select 1 from public.projects p where p.id = project_id and p.visibility = 'public')
  );

create policy "activity_select" on public.project_activity
  for select to authenticated
  using (
    public.is_project_member(project_id)
    or exists (select 1 from public.projects p where p.id = project_id and p.visibility = 'public')
  );

-- ---------------------------------------------------------------------------
-- Backfill for projects that existed before this migration
-- ---------------------------------------------------------------------------
insert into public.research_versions (project_id, field, version, content, author_id, created_at)
select p.id, f.field, 1, f.content, p.owner_id, p.created_at
from public.projects p
cross join lateral (
  values
    ('title'::public.research_field_name, p.title),
    ('research_question', p.research_question),
    ('hypothesis', p.hypothesis),
    ('methodology', p.methodology)
) as f(field, content)
on conflict (project_id, field, version) do nothing;

insert into public.project_activity (project_id, actor_id, type, payload, created_at)
select p.id, p.owner_id, 'project_created', jsonb_build_object('title', p.title), p.created_at
from public.projects p
where not exists (
  select 1 from public.project_activity a where a.project_id = p.id and a.type = 'project_created'
);

insert into public.project_activity (project_id, actor_id, type, payload, created_at)
select r.project_id, r.author_id, 'result_added', jsonb_build_object('id', r.id, 'title', r.title), r.created_at
from public.research_results r
where not exists (
  select 1 from public.project_activity a
  where a.project_id = r.project_id and a.type = 'result_added' and a.payload ->> 'id' = r.id::text
);

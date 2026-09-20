-- Asterra — social features: connections (friends), project join requests, bookmarks, avatar storage.
-- Run AFTER 0001_init.sql.

-- ---------------------------------------------------------------------------
-- connections: friend requests between two profiles
-- ---------------------------------------------------------------------------
create type public.connection_status as enum ('pending', 'accepted');

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id),
  -- one connection per pair regardless of direction
  constraint connections_pair_unique unique (requester_id, addressee_id)
);

create index connections_addressee_idx on public.connections (addressee_id, status);
create index connections_requester_idx on public.connections (requester_id, status);

-- Prevent the mirrored duplicate (B->A when A->B exists).
create unique index connections_unordered_pair_idx
  on public.connections (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

alter table public.connections enable row level security;

create policy "connections_select_own" on public.connections
  for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy "connections_insert_requester" on public.connections
  for insert to authenticated
  with check (requester_id = auth.uid());
create policy "connections_update_addressee" on public.connections
  for update to authenticated
  using (addressee_id = auth.uid()) with check (addressee_id = auth.uid());
create policy "connections_delete_either" on public.connections
  for delete to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- ---------------------------------------------------------------------------
-- project_join_requests: a user asks to join a project; the owner accepts/declines
-- ---------------------------------------------------------------------------
create type public.join_request_status as enum ('pending', 'accepted', 'declined');

create table public.project_join_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status public.join_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (project_id, user_id)
);

create index join_requests_project_idx on public.project_join_requests (project_id, status);

alter table public.project_join_requests enable row level security;

create policy "join_requests_select" on public.project_join_requests
  for select to authenticated
  using (user_id = auth.uid() or public.is_project_owner(project_id));
create policy "join_requests_insert_self" on public.project_join_requests
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "join_requests_update_owner" on public.project_join_requests
  for update to authenticated
  using (public.is_project_owner(project_id));
create policy "join_requests_delete_self_or_owner" on public.project_join_requests
  for delete to authenticated
  using (user_id = auth.uid() or public.is_project_owner(project_id));

-- ---------------------------------------------------------------------------
-- bookmarks: saved projects
-- ---------------------------------------------------------------------------
create table public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

alter table public.bookmarks enable row level security;

create policy "bookmarks_own" on public.bookmarks
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Avatar storage: public bucket, each user writes only inside their own folder
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, '{"image/png","image/jpeg","image/webp"}')
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects
  for select to public using (bucket_id = 'avatars');
create policy "avatars_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own_folder" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own_folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

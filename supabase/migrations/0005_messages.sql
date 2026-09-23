-- Asterra — direct messages between connected researchers.
-- Run AFTER 0002_social.sql.

-- True when the two profiles have an accepted connection (either direction).
create or replace function public.are_connected(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.connections c
    where c.status = 'accepted'
      and ((c.requester_id = a and c.addressee_id = b) or (c.requester_id = b and c.addressee_id = a))
  );
$$;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

-- Thread lookup (both directions) and the unread badge.
create index messages_pair_idx on public.messages (sender_id, recipient_id, created_at desc);
create index messages_inbox_idx on public.messages (recipient_id, created_at desc);
create index messages_unread_idx on public.messages (recipient_id) where read_at is null;

alter table public.messages enable row level security;

-- Both sides of a thread can read it.
create policy "messages_select_own" on public.messages
  for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());

-- You may only write as yourself, and only to a connection.
create policy "messages_insert_connected" on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.are_connected(auth.uid(), recipient_id));

-- Only the recipient marks a message as read; nothing else may change.
create policy "messages_update_recipient" on public.messages
  for update to authenticated
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- Either side can delete their own copy of the conversation history.
create policy "messages_delete_sender" on public.messages
  for delete to authenticated
  using (sender_id = auth.uid());

alter publication supabase_realtime add table public.messages;

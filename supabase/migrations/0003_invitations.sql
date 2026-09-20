-- Asterra — project invitations (owner invites a connection; the invitee must accept)
-- and realtime notifications. Run AFTER 0002_social.sql.

-- ---------------------------------------------------------------------------
-- project_invitations
-- ---------------------------------------------------------------------------
create type public.invitation_status as enum ('pending', 'accepted', 'declined');

create table public.project_invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  invitee_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'contributor',
  message text not null default '',
  status public.invitation_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (inviter_id <> invitee_id),
  check (role <> 'owner'),
  unique (project_id, invitee_id)
);

create index project_invitations_invitee_idx on public.project_invitations (invitee_id, status);
create index project_invitations_project_idx on public.project_invitations (project_id, status);

alter table public.project_invitations enable row level security;

-- Visible to the invitee and to the project owner.
create policy "invitations_select" on public.project_invitations
  for select to authenticated
  using (invitee_id = auth.uid() or public.is_project_owner(project_id));

-- Only the owner can invite, and only people they are connected with.
create policy "invitations_insert_owner_connected" on public.project_invitations
  for insert to authenticated
  with check (
    inviter_id = auth.uid()
    and public.is_project_owner(project_id)
    and exists (
      select 1 from public.connections c
      where c.status = 'accepted'
        and ((c.requester_id = auth.uid() and c.addressee_id = invitee_id)
          or (c.addressee_id = auth.uid() and c.requester_id = invitee_id))
    )
  );

-- The invitee responds; the owner can withdraw (delete) a pending invitation.
create policy "invitations_update_invitee" on public.project_invitations
  for update to authenticated
  using (invitee_id = auth.uid()) with check (invitee_id = auth.uid());
create policy "invitations_delete_owner_or_invitee" on public.project_invitations
  for delete to authenticated
  using (invitee_id = auth.uid() or public.is_project_owner(project_id));

-- Accepting must add a member row, which RLS reserves for the owner —
-- so it runs as a security-definer function that verifies the caller is the invitee.
create or replace function public.accept_project_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.project_invitations%rowtype;
begin
  select * into inv from public.project_invitations where id = p_invitation_id for update;
  if not found then
    raise exception 'Invitation not found';
  end if;
  if inv.invitee_id <> auth.uid() then
    raise exception 'Only the invited person can accept';
  end if;
  if inv.status <> 'pending' then
    raise exception 'Invitation already answered';
  end if;

  insert into public.project_members (project_id, user_id, role)
  values (inv.project_id, inv.invitee_id, inv.role)
  on conflict (project_id, user_id) do nothing;

  update public.project_invitations
  set status = 'accepted', responded_at = now()
  where id = p_invitation_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Realtime: let the browser subscribe to its own notifications (RLS still applies).
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.notifications;

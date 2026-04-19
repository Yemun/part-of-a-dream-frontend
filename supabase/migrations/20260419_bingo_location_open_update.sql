-- Allow anon clients to update bingo_locations (latitude/longitude, etc.).
-- Access control for "who can edit" is enforced only in the frontend
-- (player.name === '이소정'). This is a loose-policy choice for an
-- event-scope table; revisit if abuse becomes a concern.

alter table public.bingo_locations enable row level security;

drop policy if exists "bingo_locations_update_anon" on public.bingo_locations;

create policy "bingo_locations_update_anon"
on public.bingo_locations
for update
to anon, authenticated
using (true)
with check (true);

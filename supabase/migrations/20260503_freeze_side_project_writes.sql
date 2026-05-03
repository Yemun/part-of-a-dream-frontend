-- Freeze public writes for side-project tables.
-- The app still reads a snapshot from Supabase on load, but all user actions
-- after that run against device session cache only.

alter table public.bingo_locations enable row level security;
alter table public.bingo_players enable row level security;
alter table public.bingo_checks enable row level security;
alter table public.bingo_lines enable row level security;
alter table public.jangbogi_categories enable row level security;
alter table public.jangbogi_items enable row level security;
alter table public.jangbogi_shopping enable row level security;

revoke insert, update, delete on table public.bingo_locations from anon, authenticated;
revoke insert, update, delete on table public.bingo_players from anon, authenticated;
revoke insert, update, delete on table public.bingo_checks from anon, authenticated;
revoke insert, update, delete on table public.bingo_lines from anon, authenticated;
revoke insert, update, delete on table public.jangbogi_categories from anon, authenticated;
revoke insert, update, delete on table public.jangbogi_items from anon, authenticated;
revoke insert, update, delete on table public.jangbogi_shopping from anon, authenticated;

grant select on table public.bingo_locations to anon, authenticated;
grant select on table public.bingo_players to anon, authenticated;
grant select on table public.bingo_checks to anon, authenticated;
grant select on table public.bingo_lines to anon, authenticated;
grant select on table public.jangbogi_categories to anon, authenticated;
grant select on table public.jangbogi_items to anon, authenticated;
grant select on table public.jangbogi_shopping to anon, authenticated;

drop policy if exists "bingo_locations_update_anon" on public.bingo_locations;

drop policy if exists "side_project_bingo_locations_read" on public.bingo_locations;
create policy "side_project_bingo_locations_read"
on public.bingo_locations
for select
to anon, authenticated
using (true);

drop policy if exists "side_project_bingo_players_read" on public.bingo_players;
create policy "side_project_bingo_players_read"
on public.bingo_players
for select
to anon, authenticated
using (true);

drop policy if exists "side_project_bingo_checks_read" on public.bingo_checks;
create policy "side_project_bingo_checks_read"
on public.bingo_checks
for select
to anon, authenticated
using (true);

drop policy if exists "side_project_bingo_lines_read" on public.bingo_lines;
create policy "side_project_bingo_lines_read"
on public.bingo_lines
for select
to anon, authenticated
using (true);

drop policy if exists "side_project_jangbogi_categories_read" on public.jangbogi_categories;
create policy "side_project_jangbogi_categories_read"
on public.jangbogi_categories
for select
to anon, authenticated
using (true);

drop policy if exists "side_project_jangbogi_items_read" on public.jangbogi_items;
create policy "side_project_jangbogi_items_read"
on public.jangbogi_items
for select
to anon, authenticated
using (true);

drop policy if exists "side_project_jangbogi_shopping_read" on public.jangbogi_shopping;
create policy "side_project_jangbogi_shopping_read"
on public.jangbogi_shopping
for select
to anon, authenticated
using (true);

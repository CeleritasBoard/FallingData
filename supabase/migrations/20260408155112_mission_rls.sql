-- 1) Allow reads at the DB privilege level
grant select on table public.mission_settings to anon, authenticated;

-- 2) Ensure RLS is enabled (safe baseline)
alter table public.mission_settings enable row level security;

-- 3) Allow public reads via RLS
create policy "mission_settings public read"
on public.mission_settings
for select
to anon, authenticated
using (true);

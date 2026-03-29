create extension if not exists "pg_cron" with schema "pg_catalog";

drop extension if exists "pg_net";

revoke delete on table "public"."mission_settings" from "anon";

revoke insert on table "public"."mission_settings" from "anon";

revoke select on table "public"."mission_settings" from "anon";

revoke update on table "public"."mission_settings" from "anon";

alter table "public"."documents" enable row level security;

alter table "public"."graphs" enable row level security;

alter table "public"."mission_settings" enable row level security;

alter table "public"."missions" enable row level security;


  create policy "Allow reads on docs"
  on "public"."documents"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Allow udate to authenticated users"
  on "public"."documents"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Enable delete for authenticated users"
  on "public"."documents"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."documents"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable delete for authenticated users"
  on "public"."graphs"
  as permissive
  for delete
  to public
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."graphs"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all authenticated users"
  on "public"."graphs"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable reads for public graphs"
  on "public"."graphs"
  as permissive
  for select
  to anon
using ((published = true));



  create policy "Enable updates for authenticated users"
  on "public"."graphs"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Enable insertion, update and deletion for authenticated users"
  on "public"."mission_settings"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Enable read access for all users"
  on "public"."mission_settings"
  as permissive
  for select
  to public
using (true);



  create policy "Enable insertion, update, deletion for authenticated users"
  on "public"."missions"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Enable reads for published missions"
  on "public"."missions"
  as permissive
  for select
  to anon
using ((status = 'PUBLISHED'::public."MissionState"));


revoke
select
  on table public.mission_settings
from
  anon;


  grant
  select
    (resolution, min_voltage, max_voltage) on table public.mission_settings to anon;

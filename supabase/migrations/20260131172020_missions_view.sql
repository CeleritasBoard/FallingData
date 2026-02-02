drop extension if exists "pg_cron";

drop view if exists "public"."commands_table";

alter table "public"."commands" add column "mission_id" integer;

alter table "public"."commands" alter column "execution_time" drop default;

alter table "public"."commands" alter column "queue_id" set not null;

alter table "public"."commands" disable row level security;

alter table "public"."packets" add column "mission_id" integer;

alter table "public"."packets" disable row level security;

alter table "public"."commands" add constraint "mission" FOREIGN KEY (mission_id) REFERENCES public.missions(id) not valid;

alter table "public"."commands" validate constraint "mission";

alter table "public"."packets" add constraint "mission" FOREIGN KEY (mission_id) REFERENCES public.missions(id) not valid;

alter table "public"."packets" validate constraint "mission";

set check_function_bodies = off;

create or replace view "public"."commands_table" as  SELECT commands.id,
    commands.cmd_device,
    commands.execution_time,
    commands.type,
    commands.command,
    commands.state,
    u.raw_user_meta_data AS meta
   FROM (public.commands
     LEFT JOIN auth.users u ON ((commands.user_id = u.id)));


CREATE OR REPLACE FUNCTION public.schedule_command(id integer, cron_time text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
perform cron.schedule('upload-cmd-' || id, cron_time, 'select upload_command(' || id || ')');
end;
$function$
;



drop view if exists "public"."commands_table";
ALTER TABLE public.missions
ALTER COLUMN "createdBy" TYPE uuid USING 'ca738d45-3ca5-4022-926b-3f491815f329'::uuid;

create or replace view "public"."missions_table" as  SELECT missions.id,
    missions.name,
    missions.execution_time,
    missions.device,
    missions.status,
    u.raw_user_meta_data AS meta
   FROM (public.missions
     LEFT JOIN auth.users u ON ((missions."createdBy" = u.id)));


create or replace view "public"."commands_table" as  SELECT commands.id,
    commands.cmd_device,
    commands.execution_time,
    commands.type,
    commands.command,
    commands.state,
    u.raw_user_meta_data AS meta
   FROM (public.commands
     LEFT JOIN auth.users u ON ((commands.user_id = u.id)));




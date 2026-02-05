alter table "public"."commands" alter column "queue_id" drop not null;

create or replace view "public"."commands_table" as  SELECT commands.id,
    commands.cmd_device,
    commands.execution_time,
    commands.type,
    commands.command,
    commands.state,
    u.raw_user_meta_data AS meta
   FROM (public.commands
     LEFT JOIN auth.users u ON ((commands.user_id = u.id)));




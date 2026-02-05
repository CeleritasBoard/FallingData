-- Adding Database functions

CREATE OR REPLACE FUNCTION schedule_mission(
    id integer,
    cron_time text
) returns void
security definer
language plpgsql as $$
begin
perform cron.schedule('upload-mission-' || id, cron_time, 'SELECT upload_mission(' || id || ')');
end;
$$;

CREATE OR REPLACE FUNCTION upload_mission(
    command_id integer
) returns void
security definer
language plpgsql as $$
begin
    update public.commands set state = 'UPLOADED' where id = command_id;
    perform cron.unschedule('upload-mission-' || command_id);
end;
$$;

CREATE OR REPLACE FUNCTION abort_mission(
    command_id integer
) returns void
security definer
language plpgsql as $$
begin
perform cron.unschedule('upload-mission-' || command_id);
end;
$$;

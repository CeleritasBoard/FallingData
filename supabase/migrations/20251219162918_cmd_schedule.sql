--- Install cron extension
create extension pg_cron;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Adding Database functions

CREATE OR REPLACE FUNCTION schedule_command(
    id integer,
    cron_time text
) returns void
security definer
language plpgsql as $$
begin
perform cron.schedule('upload-cmd-' || id, cron_time, 'SELECT upload_command(' || id || ')');
end;
$$;

CREATE OR REPLACE FUNCTION upload_command(
    command_id integer
) returns void
security definer
language plpgsql as $$
begin
    update public.commands set state = 'UPLOADED' where id = command_id;
    perform cron.unschedule('upload-cmd-' || command_id);
end;
$$;

--- Install cron extension
create extension pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Adding Database functions

CREATE OR REPLACE FUNCTION schedule_command(
    id integer,
    cron_time text
) returns void
language plpgsql as $$
begin
select cron.schedule('upload-cmd-' || id, cron_time, 'CALL upload_command(' || id || ')');
end;
$$;

CREATE OR REPLACE FUNCTION upload_command(
    id integer
) returns void
language plpgsql as $$
begin
    update commands set state = 'UPLOADED' where id = id;
    select cron.unschedule('upload-cmd-' || id);
end;
$$;

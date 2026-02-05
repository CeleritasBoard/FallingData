CREATE OR REPLACE FUNCTION unschedule_cron(
    job varchar
) returns void
security definer
language plpgsql as $$
begin
perform cron.unschedule(job);
end;
$$;

drop function if exists abort_mission;

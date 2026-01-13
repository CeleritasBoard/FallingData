create view commands_table as
    select
        commands.id as id,
        cmd_device,
        execution_time,
        type,
        command,
        state,
        u.raw_user_meta_data as meta
    from public.commands
    left join auth.users as u on commands.user_id = u.id;

grant all on table commands_table to authenticated;

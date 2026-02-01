
CREATE TABLE public.commands (
                                 id             SERIAL PRIMARY KEY,
                                 execution_time TIMESTAMP WITH TIME ZONE,
                                 cmd_id         INTEGER                  NOT NULL,
                                 queue_id       INTEGER                  NOT NULL,
                                 cmd_device     device                   NOT NULL,
                                 type           CommandType            NOT NULL,
                                 user_id        UUID,
                                 command        VARCHAR(16)               NOT NULL,
                                 state          CommandState           NOT NULL DEFAULT 'CREATED',
                                 deleted_by     UUID,
                                 params         JSONB,
                                 mission_id     INTEGER,
                                 CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id),
                                 CONSTRAINT fk_deleted_by FOREIGN KEY(deleted_by) REFERENCES auth.users(id),
                                 CONSTRAINT mission FOREIGN KEY(mission_id) REFERENCES missions(id)
);

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

-- Inserting test data into the "public"."commands" table

INSERT INTO "public"."commands" (
    "execution_time",
    "cmd_id",
    "queue_id",
    "command",
    "type",
    "state",
    "params",
    "cmd_device",
    "user_id",
    "deleted_by"
) VALUES
-- Row 1: A scheduled command to set duration for a BME_HUNITY device
(
    '2025-10-22 10:00:00+02', -- execution_time
    1,                          -- cmd_id
    101,                        -- queue_id
    '01A0B1C2',                 -- command
    'SET_DURATION',             -- type
    'SCHEDULED',                -- state
    '{"duration_seconds": 3600}', -- params
    'BME_HUNITY',               -- cmd_device
    NULL, -- user_id
    NULL                        -- deleted_by
),

-- Row 2: An uploaded command to request a measurement from an ONIONSAT_TEST device
(
    '2025-10-21 21:30:15+02',   -- execution_time
    2,                          -- cmd_id
    102,                        -- queue_id
    '02D3E4F5',                 -- command
    'REQUEST_MEASUREMENT',      -- type
    'UPLOADED',                 -- state
    NULL,                       -- params (no parameters needed)
    'ONIONSAT_TEST',            -- cmd_device
    NULL, -- user_id
    NULL                        -- deleted_by
),

-- Row 3: A created command to reset a SLOTH device
(
    DEFAULT,                    -- execution_time (will use now())
    3,                          -- cmd_id
    103,                        -- queue_id
    '03AABBCC',                 -- command
    'RESET',                    -- type
    'CREATED',                  -- state (will use the default 'CREATED')
    '{"reset_level": "soft"}',  -- params
    'SLOTH',                    -- cmd_device
    NULL, -- user_id
    NULL                        -- deleted_by
),

-- Row 4: A deleted command that was previously created
(
    '2025-10-20 14:00:00+02',   -- execution_time
    4,                          -- cmd_id
    104,                        -- queue_id
    '04FF00EE',                 -- command
    'SAVE',                     -- type
    'DELETED',                  -- state
    NULL,                       -- params
    'BME_HUNITY',               -- cmd_device
    NULL, -- user_id
    NULL  -- deleted_by (deleted by the other user)
),

-- Row 5: Another scheduled command for a future time
(
    '2025-11-01 09:00:00+01',   -- execution_time (Note the timezone change for winter)
    5,                          -- cmd_id
    105,                        -- queue_id
    '05112233',                 -- command
    'FORCE_STATUS_REPORT',      -- type
    'SCHEDULED',                -- state
    '{"report_type": "full"}',  -- params
    'ONIONSAT_TEST',            -- cmd_device
    NULL, -- user_id
    NULL                        -- deleted_by
);

-- Adding Database functions

CREATE OR REPLACE FUNCTION schedule_command(
    id integer,
    cron_time text
) returns void
security definer
language plpgsql as $$
begin
perform cron.schedule('upload-cmd-' || id, cron_time, 'select upload_command(' || id || ')');
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

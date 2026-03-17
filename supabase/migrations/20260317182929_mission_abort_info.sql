drop view if exists missions_table;
CREATE VIEW missions_table AS
SELECT missions.id,
    missions.name,
    missions.execution_time,
    missions.device,
    missions.status,
    missions."abortInfo",
    c.raw_user_meta_data AS meta,
    a.raw_user_meta_data AS abort_meta
   FROM public.missions
     LEFT JOIN auth.users c ON ((missions."createdBy" = c.id))
     LEFT JOIN auth.users a ON ((missions."abortInfo"->>'user' = TEXT(a.id)));

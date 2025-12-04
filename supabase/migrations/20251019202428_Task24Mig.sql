create type "public"."commandstate" as enum ('CREATED', 'SCHEDULED', 'UPLOADED', 'DELETED');

create type "public"."commandtype" as enum ('SET_DURATION', 'SET_SCALE', 'REQUEST_MEASUREMENT', 'REQUEST_SELFTEST', 'FORCE_STATUS_REPORT', 'RESET', 'RESTART', 'SAVE', 'STOP_MEASUREMENT');

create type "public"."device" as enum ('BME_HUNITY', 'ONIONSAT_TEST', 'SLOTH');

create type "public"."packettype" as enum ('WELCOME', 'FLASH_DUMP', 'HEADER', 'SPECTRUM', 'SELFTEST', 'DEFAULT_STATUS_REPORT', 'FORCED_STATUS_REPORT', 'ERROR', 'GEIGER_COUNT');

create sequence "public"."commands_id_seq";

create sequence "public"."packets_id_seq";

create table "public"."commands" (
    "id" integer not null default nextval('commands_id_seq'::regclass),
    "execution_time" timestamp with time zone not null default now(),
    "cmd_id" integer not null,
    "queue_id" integer not null,
    "command" character varying(8) not null,
    "type" commandtype not null,
    "state" commandstate not null default 'CREATED'::commandstate,
    "params" jsonb,
    "cmd_device" device not null,
    "user_id" uuid,
    "deleted_by" uuid
);


create table "public"."packets" (
    "id" integer not null default nextval('packets_id_seq'::regclass),
    "type" packettype,
    "date" timestamp with time zone,
    "device" device,
    "packet" text,
    "details" jsonb
);

alter table "commands" enable row level security;

alter sequence "public"."commands_id_seq" owned by "public"."commands"."id";

alter sequence "public"."packets_id_seq" owned by "public"."packets"."id";

CREATE UNIQUE INDEX commands_pkey ON public.commands USING btree (id);

CREATE UNIQUE INDEX packets_pkey ON public.packets USING btree (id);

alter table "public"."commands" add constraint "commands_pkey" PRIMARY KEY using index "commands_pkey";

alter table "public"."packets" add constraint "packets_pkey" PRIMARY KEY using index "packets_pkey";

grant delete on table "public"."commands" to "anon";

grant insert on table "public"."commands" to "anon";

grant references on table "public"."commands" to "anon";

grant select on table "public"."commands" to "anon";

grant trigger on table "public"."commands" to "anon";

grant truncate on table "public"."commands" to "anon";

grant update on table "public"."commands" to "anon";

grant delete on table "public"."commands" to "authenticated";

grant insert on table "public"."commands" to "authenticated";

grant references on table "public"."commands" to "authenticated";

grant select on table "public"."commands" to "authenticated";

grant trigger on table "public"."commands" to "authenticated";

grant truncate on table "public"."commands" to "authenticated";

grant update on table "public"."commands" to "authenticated";

grant delete on table "public"."commands" to "service_role";

grant insert on table "public"."commands" to "service_role";

grant references on table "public"."commands" to "service_role";

grant select on table "public"."commands" to "service_role";

grant trigger on table "public"."commands" to "service_role";

grant truncate on table "public"."commands" to "service_role";

grant update on table "public"."commands" to "service_role";

grant delete on table "public"."packets" to "anon";

grant insert on table "public"."packets" to "anon";

grant references on table "public"."packets" to "anon";

grant select on table "public"."packets" to "anon";

grant trigger on table "public"."packets" to "anon";

grant truncate on table "public"."packets" to "anon";

grant update on table "public"."packets" to "anon";

grant delete on table "public"."packets" to "authenticated";

grant insert on table "public"."packets" to "authenticated";

grant references on table "public"."packets" to "authenticated";

grant select on table "public"."packets" to "authenticated";

grant trigger on table "public"."packets" to "authenticated";

grant truncate on table "public"."packets" to "authenticated";

grant update on table "public"."packets" to "authenticated";

grant delete on table "public"."packets" to "service_role";

grant insert on table "public"."packets" to "service_role";

grant references on table "public"."packets" to "service_role";

grant select on table "public"."packets" to "service_role";

grant trigger on table "public"."packets" to "service_role";

grant truncate on table "public"."packets" to "service_role";

grant update on table "public"."packets" to "service_role";



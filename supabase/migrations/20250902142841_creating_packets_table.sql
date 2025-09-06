create type "public"."device" as enum ('BME_HUNITY', 'ONIONSAT_TEST', 'SLOTH');

create type "public"."packettype" as enum ('WELCOME', 'FLASH_DUMP', 'HEADER', 'SPECTRUM', 'SELFTEST', 'STATUS_REPORT', 'ERROR', 'GEIGER_COUNT');

create sequence "public"."packets_id_seq";

create table "public"."packets" (
    "id" integer not null default nextval('packets_id_seq'::regclass),
    "type" packettype,
    "date" timestamp with time zone,
    "device" device,
    "packet" text,
    "details" jsonb
);


alter sequence "public"."packets_id_seq" owned by "public"."packets"."id";

CREATE UNIQUE INDEX packets_pkey ON public.packets USING btree (id);

alter table "public"."packets" add constraint "packets_pkey" PRIMARY KEY using index "packets_pkey";

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

INSERT INTO packets(type, date, device, packet, details)
VALUES
    ('SPECTRUM', '2025-09-02 16:37:14+02', 'BME_HUNITY', '1234567890', '{"sensor_id": "temp_01", "value": 25.5}'),
    ('HEADER', '2025-08-02 16:37:14+02', 'SLOTH', '1234567891', '{"sensor_id": "temp_02", "value": 26.5}'),
    ('HEADER', '2025-08-02 16:37:14+02', 'SLOTH', '1234567891', '{"sensor_id": "temp_02", "value": 26.5}');

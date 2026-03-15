create type "graph_type" as enum('spectrum', 'custom');

create table "graphs" (
  "id" serial primary key,
  "mission" integer not null references "missions",
  "type" graph_type not null,
  "description" text,
  "featured" boolean default false,
  "published" boolean default false,
  "data" jsonb not null
);

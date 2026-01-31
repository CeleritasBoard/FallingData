alter table "packets" add column "mission" integer default null references "missions";
alter table "commands" add column "mission" integer default null references "missions";

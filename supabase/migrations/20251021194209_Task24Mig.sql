alter table "public"."commands" alter column "user_id" drop not null;

alter table "public"."commands" disable row level security;

alter table "public"."commands" add constraint "fk_deleted_by" FOREIGN KEY (deleted_by) REFERENCES auth.users(id) not valid;

alter table "public"."commands" validate constraint "fk_deleted_by";

alter table "public"."commands" add constraint "fk_user" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."commands" validate constraint "fk_user";



create table documents (
  id serial primary key,
  path text not null,
  title varchar(255),
  authors varchar(255) array,
  date timestamp with time zone not null default now(),
  uploader uuid references auth.users
);

create view documents_table as
  select
      documents.id,
      documents.path,
      documents.title,
      array_to_string(documents.authors, ', ') as authors,
      documents.date,
      u.raw_user_meta_data as uploader_meta
  from documents
  left join auth.users as u on documents.uploader = u.id;

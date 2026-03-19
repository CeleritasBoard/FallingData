create type document_type as enum ('file', 'url');

alter table documents add column type document_type not null;

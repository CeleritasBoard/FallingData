create policy "Storage upload permission"
ON storage.objects
for insert to authenticated
with check (
  true
);

create policy "Storage access permission"
ON storage.objects
for select to authenticated;

create policy "Storage delete permission"
ON storage.objects
for delete to authenticated;

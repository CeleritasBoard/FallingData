-- Add row level security to packets
alter table "packets" enable row level security;

create policy "Packets are visible to everyone"
on "packets" for select
to authenticated, anon
using ( true );

-- Add row level security to commands
alter table "commands" enable row level security;

create policy "Commands are visible to everyone"
on "commands" for select
to authenticated, anon
using ( true );

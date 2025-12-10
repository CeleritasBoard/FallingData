-- Add row level security to packets
alter table "packets" enable row level security;

create policy "Packets are visible to everyone"
on "packets" for select
to authenticated, anon
using ( true );

CREATE POLICY "Packets are insertable by anyone"
  ON packets
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Packets are updatable by anyone"
  ON packets
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Add row level security to commands
alter table "commands" enable row level security;

create policy "Commands are visible to everyone"
on "commands" for select
to authenticated, anon
using ( true );


CREATE POLICY "Commands are insertable by anyone"
  ON commands
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Commands are updatable by anyone"
  ON commands
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

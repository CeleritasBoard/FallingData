-- packets.sql
-- Enum a csomag típusának (PacketType)


-- Tábla létrehozása a csomagok (packets) számára
CREATE TABLE packets (
    id serial PRIMARY KEY,
    type PacketType,
    date timestamp with time zone,
    device Device,
    packet text,
    details jsonb
);

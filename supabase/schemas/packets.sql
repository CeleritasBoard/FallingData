-- packets.sql
-- Enum a csomag típusának (PacketType)
CREATE TYPE PacketType AS ENUM (
    'WELCOME',
    'FLASH_DUMP',
    'HEADER',
    'SPECTRUM',
    'SELFTEST',
    'STATUS_REPORT',
    'ERROR',
    'GEIGER_COUNT'
);

-- Enum az eszköz típusának (Device)
CREATE TYPE Device AS ENUM (
    'BME_HUNITY',
    'ONIONSAT_TEST',
    'SLOTH'
);

-- Tábla létrehozása a csomagok (packets) számára
CREATE TABLE packets (
    id serial PRIMARY KEY,
    type PacketType,
    date timestamp with time zone,
    device Device,
    packet text,
    details jsonb
);

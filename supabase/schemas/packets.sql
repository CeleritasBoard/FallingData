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

INSERT INTO packets(type, date, device, packet, details)
VALUES
    ('SPECTRUM', '2025-09-02 16:37:14+02', 'BME_HUNITY', '1234567890', '{"sensor_id": "temp_01", "value": 25.5}'),
    ('HEADER', '2025-08-02 16:37:14+02', 'SLOTH', '1234567891', '{"sensor_id": "temp_02", "value": 26.5}'),
    ('HEADER', '2025-08-02 16:37:14+02', 'SLOTH', '1234567891', '{"sensor_id": "temp_02", "value": 26.5}');
-- MissionState enum
CREATE TYPE "MissionState" AS ENUM (
  'CREATED',
  'SCHEDULED',
  'UPLOADED',
  'EXECUTING',
  'PROCESSING',
  'PUBLISHED',
  'ABORTED'
);

-- RequestType enum
CREATE TYPE "RequestType" AS ENUM (
  'MAX_TIME',
  'MAX_HITS'
);

-- mission_settings table
CREATE TABLE "mission_settings" (
                                    "id" SERIAL PRIMARY KEY,
                                    "start_command_id" SMALLINT,
                                    "type" "RequestType" NOT NULL,
                                    "is_okay" SMALLINT NOT NULL,
                                    "is_header" SMALLINT NOT NULL,
                                    "continue_with_full_channel" SMALLINT NOT NULL,
                                    "duration" INTEGER NOT NULL,
                                    "min_voltage" INTEGER NOT NULL,
                                    "max_voltage" INTEGER NOT NULL,
                                    "samples" SMALLINT NOT NULL,
                                    "resolution" INTEGER NOT NULL
);

-- missions table
CREATE TABLE "missions" (
                            "id" SERIAL PRIMARY KEY,
                            "name" VARCHAR(255),
                            "execution_time" TIMESTAMPTZ,
                            "device" "device" NOT NULL,
                            "status" "MissionState" NOT NULL,
                            "settings" INTEGER NOT NULL REFERENCES "mission_settings"("id"),
                            "createdBy" INTEGER NOT NULL,
                            "publishedBy" INTEGER,
                            "abortInfo" JSONB
);

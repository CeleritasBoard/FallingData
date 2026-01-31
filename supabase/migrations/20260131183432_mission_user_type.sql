ALTER TABLE missions
  ALTER COLUMN "createdBy" DROP DEFAULT,
  ALTER COLUMN "createdBy" TYPE uuid USING gen_random_uuid(),
  ALTER COLUMN "createdBy" SET DEFAULT gen_random_uuid();

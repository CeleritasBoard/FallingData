ALTER TABLE commands ALTER COLUMN execution_time DROP NOT NULL;
ALTER TABLE commands ALTER COLUMN queue_id DROP NOT NULL;
ALTER TABLE commands ALTER COLUMN command TYPE varchar (16);

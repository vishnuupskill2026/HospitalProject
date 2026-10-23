ALTER TABLE consultations ADD COLUMN status varchar(16);
UPDATE consultations SET status = CASE WHEN ended_at IS NULL THEN 'IN_PROGRESS' ELSE 'COMPLETED' END;
ALTER TABLE consultations ALTER COLUMN status SET NOT NULL;
ALTER TABLE consultations ALTER COLUMN status SET DEFAULT 'IN_PROGRESS';
ALTER TABLE consultations ADD CONSTRAINT ck_consultation_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED'));
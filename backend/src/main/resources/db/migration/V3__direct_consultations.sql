ALTER TABLE consultations ADD COLUMN patient_id uuid;
UPDATE consultations c
SET patient_id = a.patient_id
FROM appointments a
WHERE c.appointment_id = a.id;
ALTER TABLE consultations ALTER COLUMN patient_id SET NOT NULL;
ALTER TABLE consultations ALTER COLUMN appointment_id DROP NOT NULL;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_appointment_id_key;
ALTER TABLE consultations ADD CONSTRAINT fk_consultation_patient
  FOREIGN KEY (patient_id) REFERENCES patients(id);
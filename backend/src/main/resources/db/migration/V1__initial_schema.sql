CREATE TABLE user_accounts (
  id uuid PRIMARY KEY, email varchar(254) NOT NULL UNIQUE, password_hash varchar(255) NOT NULL,
  role varchar(16) NOT NULL CHECK (role IN ('DOCTOR','STAFF','PATIENT')), enabled boolean NOT NULL DEFAULT true
);
CREATE TABLE patients (
  id uuid PRIMARY KEY, first_name varchar(100) NOT NULL, last_name varchar(100) NOT NULL,
  date_of_birth date, gender varchar(40), phone varchar(30), email varchar(254), address varchar(500),
  emergency_contact_name varchar(200), emergency_contact_phone varchar(30), medical_history text,
  chief_complaints text, complaint_duration varchar(200), physical_generals text, appetite text, thirst text,
  cravings text, aversions text, thermal_reaction text, perspiration text, sleep text, dreams text,
  mental_generals text, disposition text, fears text, anxiety text, emotional_state text, modalities text,
  aggravations text, ameliorations text, past_history text, family_history text, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE INDEX idx_patient_name ON patients(last_name, first_name);
CREATE TABLE appointments (
  id uuid PRIMARY KEY, patient_id uuid NOT NULL REFERENCES patients(id), starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL, mode varchar(12) NOT NULL CHECK (mode IN ('ONLINE','OFFLINE')),
  status varchar(16) NOT NULL, video_link varchar(1000), reason text, CHECK (ends_at > starts_at)
);
CREATE INDEX idx_appointment_start ON appointments(starts_at);
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments ADD CONSTRAINT ex_appointment_no_overlap
  EXCLUDE USING gist (tstzrange(starts_at, ends_at, '[)') WITH &&)
  WHERE (status <> 'CANCELLED');
CREATE TABLE consultations (
  id uuid PRIMARY KEY, appointment_id uuid NOT NULL UNIQUE REFERENCES appointments(id), running_notes text,
  hering_cure_notes text, follow_up_at timestamptz, started_at timestamptz NOT NULL, ended_at timestamptz
);
CREATE TABLE remedies (
  id uuid PRIMARY KEY, name varchar(200) NOT NULL, potency varchar(30) NOT NULL, form varchar(120),
  quantity_on_hand integer NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  reorder_level integer NOT NULL DEFAULT 0 CHECK (reorder_level >= 0), unit_price numeric(10,2), active boolean NOT NULL DEFAULT true,
  CONSTRAINT uk_remedy_name_potency UNIQUE(name, potency)
);
CREATE TABLE prescriptions (
  id uuid PRIMARY KEY, consultation_id uuid NOT NULL REFERENCES consultations(id), prescribed_at timestamptz NOT NULL,
  dietary_restrictions text
);
CREATE TABLE prescription_items (
  id uuid PRIMARY KEY, prescription_id uuid NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  remedy_id uuid NOT NULL REFERENCES remedies(id), dosage varchar(250) NOT NULL,
  repetition varchar(250) NOT NULL, duration varchar(200)
);
CREATE TABLE invoices (
  id uuid PRIMARY KEY, invoice_number varchar(40) NOT NULL UNIQUE, patient_id uuid NOT NULL REFERENCES patients(id),
  appointment_id uuid NOT NULL UNIQUE REFERENCES appointments(id), amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  currency_code varchar(3) NOT NULL, payment_status varchar(16) NOT NULL, issued_at timestamptz NOT NULL
);
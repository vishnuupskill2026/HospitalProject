ALTER TABLE user_accounts ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
UPDATE user_accounts SET is_admin = true
WHERE id = (
  SELECT id FROM user_accounts
  WHERE role = 'DOCTOR' AND enabled = true
  ORDER BY email
  LIMIT 1
);
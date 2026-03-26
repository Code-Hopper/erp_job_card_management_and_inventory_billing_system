ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email VARCHAR;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(email);

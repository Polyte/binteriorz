CREATE UNIQUE INDEX IF NOT EXISTS users_single_owner_idx ON users(role) WHERE role='owner';

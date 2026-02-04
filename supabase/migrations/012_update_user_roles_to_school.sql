-- Update existing role values to school-focused roles
UPDATE users SET role = 'student' WHERE role = 'employee';
UPDATE users SET role = 'teacher' WHERE role = 'manager';

UPDATE model_permissions SET role = 'student' WHERE role = 'employee';
UPDATE model_permissions SET role = 'teacher' WHERE role = 'manager';

-- Update role constraints and defaults
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'guardian', 'admin'));
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';

ALTER TABLE model_permissions DROP CONSTRAINT IF EXISTS model_permissions_role_check;
ALTER TABLE model_permissions
  ADD CONSTRAINT model_permissions_role_check CHECK (role IN ('student', 'teacher', 'guardian', 'admin'));

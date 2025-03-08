/*
  # Initial Schema Setup with Default Users

  1. Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `role` (text)
      - `name` (text)
      - `class` (text, nullable)
      - `profile_url` (text, nullable)
      - `created_at` (timestamptz)
      - `last_location` (jsonb, nullable)
    
    - `attendance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (text)
      - `timestamp` (timestamptz)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `is_valid` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'student')),
  name text NOT NULL,
  class text,
  profile_url text,
  created_at timestamptz DEFAULT now(),
  last_location jsonb
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('check_in', 'check_out')),
  timestamp timestamptz DEFAULT now(),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  is_valid boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read their own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create their own attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create default users
DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
    student_user_id uuid := gen_random_uuid();
BEGIN
    -- Create admin user
    INSERT INTO auth.users (
        id,
        email,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmed_at
    ) VALUES (
        admin_user_id,
        'admin@appsenz.com',
        jsonb_build_object('name', 'Administrator'),
        now(),
        now(),
        now()
    );

    -- Set admin password
    UPDATE auth.users
    SET encrypted_password = crypt('admin123', gen_salt('bf'))
    WHERE id = admin_user_id;

    -- Create admin profile
    INSERT INTO public.users (id, username, role, name)
    VALUES (admin_user_id, 'admin', 'admin', 'Administrator');

    -- Create student user
    INSERT INTO auth.users (
        id,
        email,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmed_at
    ) VALUES (
        student_user_id,
        'student@appsenz.com',
        jsonb_build_object('name', 'Siswa Demo'),
        now(),
        now(),
        now()
    );

    -- Set student password
    UPDATE auth.users
    SET encrypted_password = crypt('student123', gen_salt('bf'))
    WHERE id = student_user_id;

    -- Create student profile
    INSERT INTO public.users (id, username, role, name, class)
    VALUES (student_user_id, 'student', 'student', 'Siswa Demo', '12 TKJ 1');

EXCEPTION WHEN unique_violation THEN
    -- Do nothing if users already exist
    NULL;
END;
$$;
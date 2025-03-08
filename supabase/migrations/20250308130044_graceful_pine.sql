/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password` (text)
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
  password text NOT NULL,
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
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read their own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create admin user
INSERT INTO users (id, username, password, role, name)
VALUES (
  'admin',
  'admin',
  'admin123',
  'admin',
  'Administrator'
) ON CONFLICT (id) DO NOTHING;
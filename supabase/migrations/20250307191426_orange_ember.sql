/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `username` (text, unique)
      - `role` (text) - either 'admin' or 'student'
      - `name` (text)
      - `class` (text, optional) - for students only
      - `profile_url` (text, optional)
      - `created_at` (timestamp)
    
    - `attendance`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references users.id
      - `type` (text) - either 'check_in' or 'check_out'
      - `timestamp` (timestamp)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `is_valid` (boolean)

  2. Security
    - Enable RLS on all tables
    - Set up appropriate policies for each role
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    name TEXT NOT NULL,
    class TEXT,
    profile_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('check_in', 'check_out')),
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    is_valid BOOLEAN DEFAULT true NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can insert users"
    ON public.users
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can update their own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policies for attendance table
CREATE POLICY "Users can view their own attendance"
    ON public.attendance
    FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can insert their own attendance"
    ON public.attendance
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own attendance"
    ON public.attendance
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
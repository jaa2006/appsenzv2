/*
  # Initial Schema Setup for GPS Attendance System

  1. Tables
    - `users`
      - Basic user information and authentication
      - Profile data including role and class for students
    - `attendance`
      - GPS-validated attendance records
      - Check-in and check-out tracking
    - `locations`
      - Allowed attendance locations
      - Geofencing configuration

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access control
    - GPS location validation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    name TEXT NOT NULL,
    class TEXT,
    profile_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('check_in', 'check_out')),
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    is_valid BOOLEAN DEFAULT true NOT NULL,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    radius INTEGER NOT NULL, -- in meters
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data"
    ON public.users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can insert users"
    ON public.users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RLS Policies for attendance
CREATE POLICY "Users can view their own attendance"
    ON public.attendance
    FOR SELECT
    USING (
        user_id = auth.uid() 
        OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own attendance"
    ON public.attendance
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for locations
CREATE POLICY "Locations are viewable by all authenticated users"
    ON public.locations
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage locations"
    ON public.locations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION check_location_valid(
    p_latitude NUMERIC,
    p_longitude NUMERIC,
    p_location_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_location public.locations%ROWTYPE;
    v_distance NUMERIC;
BEGIN
    SELECT * INTO v_location
    FROM public.locations
    WHERE id = p_location_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Calculate distance using Haversine formula
    SELECT (
        6371000 * acos(
            cos(radians(p_latitude)) * cos(radians(v_location.latitude)) *
            cos(radians(v_location.longitude) - radians(p_longitude)) +
            sin(radians(p_latitude)) * sin(radians(v_location.latitude))
        )
    ) INTO v_distance;

    RETURN v_distance <= v_location.radius;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
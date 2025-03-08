/*
  # Fix Authentication Constraints

  1. Changes
    - Add UNIQUE constraint to auth.users email column
    - Update user creation process to use UUID
    - Add better error handling for duplicate entries

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with proper constraints
*/

-- Add UNIQUE constraint to auth.users email if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'users_email_key' 
        AND conrelid = 'auth.users'::regclass
    ) THEN
        ALTER TABLE auth.users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;

-- Create or replace function for safe user creation
CREATE OR REPLACE FUNCTION create_user_safely(
    p_email TEXT,
    p_password TEXT,
    p_role TEXT,
    p_name TEXT,
    p_class TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Generate new UUID
    v_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        p_email,
        crypt(p_password, gen_salt('bf')),
        now(),
        now(),
        now()
    );

    -- Insert into public.users
    INSERT INTO public.users (
        id,
        email,
        username,
        role,
        name,
        class,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_email,
        split_part(p_email, '@', 1),
        p_role,
        p_name,
        p_class,
        now(),
        now()
    );

    RETURN v_user_id;
EXCEPTION 
    WHEN unique_violation THEN
        RAISE EXCEPTION 'User with email % already exists', p_email;
    WHEN others THEN
        RAISE EXCEPTION 'Failed to create user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
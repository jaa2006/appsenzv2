/*
  # Insert Default Data

  1. Default Users
    - Admin account
    - Demo student account
  2. Default Location
    - School location with specified coordinates
*/

-- Insert default school location
INSERT INTO public.locations (
    name,
    latitude,
    longitude,
    radius,
    is_active
) VALUES (
    'SMKN 1 Example',
    -6.960577,
    107.887102,
    20,
    true
) ON CONFLICT DO NOTHING;

-- Create default users function
CREATE OR REPLACE FUNCTION create_default_users()
RETURNS void AS $$
DECLARE
    v_admin_id uuid;
    v_student_id uuid;
BEGIN
    -- Create admin user
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
        uuid_generate_v4(),
        'authenticated',
        'authenticated',
        'admin@appsenz.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        now(),
        now()
    )
    RETURNING id INTO v_admin_id;

    -- Create admin profile
    INSERT INTO public.users (
        id,
        email,
        username,
        role,
        name,
        created_at,
        updated_at
    ) VALUES (
        v_admin_id,
        'admin@appsenz.com',
        'admin',
        'admin',
        'Administrator',
        now(),
        now()
    );

    -- Create student user
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
        uuid_generate_v4(),
        'authenticated',
        'authenticated',
        'student@appsenz.com',
        crypt('student123', gen_salt('bf')),
        now(),
        now(),
        now()
    )
    RETURNING id INTO v_student_id;

    -- Create student profile
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
        v_student_id,
        'student@appsenz.com',
        'student',
        'student',
        'Siswa Demo',
        '12-IPA-1',
        now(),
        now()
    );

EXCEPTION WHEN unique_violation THEN
    -- If users already exist, do nothing
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_default_users();
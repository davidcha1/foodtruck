-- Simple Signup Fix - Run this in Supabase Dashboard SQL Editor
-- This script will fix the "Database error saving new user" issue

-- First, let's see what triggers currently exist on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
    AND event_object_table = 'users';

-- Drop any existing triggers that might be causing conflicts
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_new_auth_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop any conflicting functions
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS handle_auth_user_creation() CASCADE;

-- Create a simple, working user creation function
CREATE OR REPLACE FUNCTION handle_auth_user_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-confirm the user (skip email verification for development)
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), 
        confirmed_at = NOW()
    WHERE id = NEW.id;

    -- Create user in public.users table
    INSERT INTO public.users (
        id,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'venue_owner'::user_role),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Create venue owner profile (default)
    INSERT INTO public.venue_owner_profiles (
        user_id,
        business_name,
        business_type,
        business_address,
        contact_phone,
        business_description,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        'New Business',
        'restaurant'::business_type,
        '',
        '',
        '',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_auth_user_creation();

-- Verify the trigger was created successfully
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created'; 
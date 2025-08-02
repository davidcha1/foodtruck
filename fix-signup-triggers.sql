-- Fix Signup Issue by Removing Conflicting Triggers
-- Run this in your Supabase Dashboard SQL Editor

-- First, drop ALL existing triggers on auth.users
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_new_auth_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the conflicting functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS handle_auth_user_creation() CASCADE;

-- Create a single, correct user creation function
CREATE OR REPLACE FUNCTION handle_auth_user_creation()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
    profile_created BOOLEAN := false;
BEGIN
    -- Auto-confirm the user (skip email verification for development)
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), 
        confirmed_at = NOW()
    WHERE id = NEW.id;

    -- Extract role from raw_user_meta_data, default to venue_owner
    user_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'venue_owner'::user_role
    );

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
        user_role,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Create appropriate profile based on role
    IF user_role = 'venue_owner' THEN
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
        profile_created := true;
    ELSIF user_role = 'vendor' THEN
        INSERT INTO public.vendor_profiles (
            user_id,
            food_truck_name,
            cuisine_type,
            truck_description,
            operating_radius_km,
            setup_time_minutes,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'New Food Truck',
            'international'::cuisine_type,
            '',
            50,
            30,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO NOTHING;
        profile_created := true;
    END IF;

    -- Log the creation
    RAISE NOTICE 'User created: ID=%, Email=%, Role=%, Profile Created=%', 
        NEW.id, NEW.email, user_role, profile_created;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the single trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_auth_user_creation();

-- Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created'; 
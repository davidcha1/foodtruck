-- Direct Fix for Signup Issue
-- Run this in Supabase Dashboard SQL Editor

-- Step 1: Check current state
SELECT 'Current triggers on auth.users:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
    AND event_object_table = 'users';

-- Step 2: Clean up any existing triggers (ignore errors)
DO $$
BEGIN
    DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
    DROP TRIGGER IF EXISTS handle_new_auth_user ON auth.users;
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    RAISE NOTICE 'Dropped existing triggers';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping triggers: %', SQLERRM;
END $$;

-- Step 3: Clean up any existing functions (ignore errors)
DO $$
BEGIN
    DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
    DROP FUNCTION IF EXISTS handle_new_auth_user() CASCADE;
    DROP FUNCTION IF EXISTS handle_auth_user_creation() CASCADE;
    RAISE NOTICE 'Dropped existing functions';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping functions: %', SQLERRM;
END $$;

-- Step 4: Create the user creation function
CREATE OR REPLACE FUNCTION public.handle_auth_user_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-confirm the user
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

    -- Create venue owner profile
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

    RAISE NOTICE 'User created successfully: ID=%, Email=%', NEW.id, NEW.email;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_creation();

-- Step 6: Verify everything was created
SELECT 'Verification:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created';

SELECT 'Function created:' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'handle_auth_user_creation'; 
-- Comprehensive cleanup script to fix authentication and user creation issues
-- Run this directly in Supabase SQL Editor

-- Step 1: Clean up any corrupted user data
DELETE FROM auth.users WHERE email IN (
    'venue.owner@example.com',
    'venue.owner@test.com',
    'food.truck@example.com',
    'pizza.truck@example.com'
);

DELETE FROM public.users WHERE email IN (
    'venue.owner@example.com', 
    'venue.owner@test.com',
    'food.truck@example.com',
    'pizza.truck@example.com'
);

-- Step 2: Clean up any orphaned records
DELETE FROM public.venue_owner_profiles WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.vendor_profiles WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.bookings WHERE vendor_id NOT IN (SELECT id FROM public.users);
DELETE FROM public.bookings WHERE listing_id NOT IN (SELECT id FROM public.listings);
DELETE FROM public.listings WHERE owner_id NOT IN (SELECT id FROM public.users);

-- Step 3: Check and fix the user creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_creation();

-- Create the corrected user creation function
CREATE OR REPLACE FUNCTION public.handle_auth_user_creation()
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

    -- Extract role from raw_user_meta_data
    user_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'venue_owner'::user_role
    );

    -- Create user in public.users table
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
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
    ELSIF user_role = 'food_truck_vendor' THEN
        INSERT INTO public.vendor_profiles (
            user_id,
            food_truck_name,
            cuisine_type,
            truck_description,
            operating_radius_km,
            min_booking_hours,
            setup_time_minutes,
            cleanup_time_minutes,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'New Food Truck',
            'international'::cuisine_type,
            '',
            50,
            4,
            30,
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

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_creation();

-- Step 4: Show current state
SELECT 
    'Current Users' as info,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Public Users' as info,
    COUNT(*) as count  
FROM public.users
UNION ALL
SELECT
    'Venue Owner Profiles' as info,
    COUNT(*) as count
FROM public.venue_owner_profiles
UNION ALL  
SELECT
    'Vendor Profiles' as info,
    COUNT(*) as count
FROM public.vendor_profiles;

-- Step 5: Test that the trigger function works
SELECT 'Cleanup completed successfully!' as status; 
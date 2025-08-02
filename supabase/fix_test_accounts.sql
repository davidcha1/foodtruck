-- Fix test accounts to work with Supabase auth
-- This script removes the old incompatible accounts and recreates them properly

-- Remove existing test accounts that have incompatible password hashing
DELETE FROM auth.users WHERE email IN (
    'venue.owner@example.com',
    'food.truck@example.com', 
    'pizza.truck@example.com'
);

-- Remove corresponding public.users records
DELETE FROM public.users WHERE email IN (
    'venue.owner@example.com',
    'food.truck@example.com',
    'pizza.truck@example.com'
);

-- The proper way to create test accounts is through the signup API
-- These will be created when users sign up normally through the application
-- The sample data script will then populate venues and bookings for them

-- This is a note for the developer: 
-- After running this script, create test accounts by:
-- 1. Going to /auth/signup in your app
-- 2. Creating accounts with these credentials:
--    venue.owner@test.com / password123 (Venue Owner)
--    food.truck@test.com / password123 (Food Truck Vendor)
--    pizza.truck@test.com / password123 (Food Truck Vendor)
-- 3. Then run the sample data creation script to populate their data

-- Alternatively, you can use Supabase's admin panel to create users,
-- but they must be created through Supabase's auth system, not direct SQL inserts 
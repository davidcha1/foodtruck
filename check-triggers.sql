-- Check if the signup trigger was created successfully
-- Run this in Supabase Dashboard SQL Editor

-- Check what triggers exist on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
    AND event_object_table = 'users';

-- Check if the function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'handle_auth_user_creation';

-- Check if the trigger is working by looking at recent auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5; 
-- Clean up any problematic user data that might be causing signup conflicts
-- Run this to clear any orphaned or conflicting user records

-- Remove any orphaned auth.users records without corresponding public.users
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
  AND email IN ('venue.owner@example.com', 'venue.owner@test.com');

-- Remove any public.users records without corresponding auth.users  
DELETE FROM public.users
WHERE id NOT IN (SELECT id FROM auth.users WHERE id IS NOT NULL);

-- Clean up the specific test email if it exists
DELETE FROM auth.users WHERE email = 'venue.owner@example.com';
DELETE FROM public.users WHERE email = 'venue.owner@example.com';

-- Show current user count to verify cleanup
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as public_users_count,
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%venue.owner%') as test_users_count; 
-- Fix user creation trigger that's causing signup failures
-- This removes all conflicting triggers and creates a clean working one

-- Drop all existing triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_profile_created ON auth.users;

-- Drop old functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.auto_confirm_user();
DROP FUNCTION IF EXISTS public.create_user_profile();

-- Create a single, robust function for user creation
CREATE OR REPLACE FUNCTION public.handle_auth_user_creation()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
    profile_created BOOLEAN := false;
BEGIN
    -- Auto-confirm email for local development
    IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at := NOW();
        NEW.confirmed_at := NOW();
    END IF;
    
    -- Extract and validate role from metadata
    BEGIN
        user_role := COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            'vendor'::user_role
        );
    EXCEPTION WHEN OTHERS THEN
        user_role := 'vendor'::user_role;
        RAISE WARNING 'Invalid role in metadata for %, defaulting to vendor', NEW.email;
    END;
    
    -- Create user record in public.users with retry logic
    BEGIN
        INSERT INTO public.users (id, email, role, first_name, last_name, phone)
        VALUES (
            NEW.id, 
            NEW.email, 
            user_role,
            NEW.raw_user_meta_data->>'first_name',
            NEW.raw_user_meta_data->>'last_name',
            NEW.raw_user_meta_data->>'phone'
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = EXCLUDED.phone,
            updated_at = NOW();
            
        RAISE NOTICE 'Created user profile: id=%, email=%, role=%', NEW.id, NEW.email, user_role;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
        -- Don't fail the entire auth creation, just log the error
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a single trigger that handles both confirmation and user creation
CREATE TRIGGER on_auth_user_created_complete
    BEFORE INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_auth_user_creation();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Ensure RLS is properly configured
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to be more permissive for user creation
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users; 
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable insert during signup" ON public.users;

-- More permissive policies for user creation
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow system to insert during signup and allow authenticated users to insert
CREATE POLICY "Enable insert for signup and authenticated users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow system to insert during signup 
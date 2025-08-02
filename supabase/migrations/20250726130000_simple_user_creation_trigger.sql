-- Simple and robust user creation trigger
-- This replaces the previous complex trigger with a simpler approach

-- Drop any existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created_complete ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_creation ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_auth_user_creation();

-- Create a simple, robust function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Auto-confirm email for local development
    IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at := NOW();
        NEW.confirmed_at := NOW();
    END IF;

    -- Extract role from metadata, default to vendor
    BEGIN
        user_role := COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            'vendor'::user_role
        );
    EXCEPTION WHEN OTHERS THEN
        user_role := 'vendor'::user_role;
    END;

    -- Insert user record with conflict handling
    INSERT INTO public.users (
        id, 
        email, 
        role, 
        first_name, 
        last_name, 
        phone,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();

    -- Create profile based on role
    IF user_role = 'venue_owner' THEN
        INSERT INTO public.venue_owner_profiles (user_id, business_name, business_type)
        VALUES (NEW.id, '', 'other')
        ON CONFLICT (user_id) DO NOTHING;
    ELSIF user_role = 'vendor' THEN
        INSERT INTO public.vendor_profiles (user_id, food_truck_name, cuisine_type)
        VALUES (NEW.id, '', 'other')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the auth creation
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for signup and authenticated users" ON public.users;

-- Create simple, permissive policies
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for all" ON public.users
    FOR INSERT WITH CHECK (true); 
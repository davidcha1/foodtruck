-- Auto-confirm users in local development environment
-- This modification updates the trigger to automatically confirm email addresses

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Extract role from metadata with better error handling
    BEGIN
        user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'vendor')::user_role;
    EXCEPTION WHEN OTHERS THEN
        -- If role extraction fails, default to vendor
        user_role := 'vendor'::user_role;
    END;
    
    -- Auto-confirm email for local development
    -- In production, remove this or make it conditional
    IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at := NOW();
        NEW.confirmed_at := NOW();
    END IF;
    
    -- Insert user record with error handling
    BEGIN
        INSERT INTO public.users (id, email, role)
        VALUES (NEW.id, NEW.email, user_role)
        ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate key errors
        
        -- Log successful creation (optional, remove in production)
        RAISE NOTICE 'Created user record: id=%, email=%, role=% (auto-confirmed)', NEW.id, NEW.email, user_role;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the auth user creation
        RAISE WARNING 'Failed to create user record for %: %', NEW.email, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

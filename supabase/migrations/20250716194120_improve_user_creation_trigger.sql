-- Improved function to handle new user creation with better error handling
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
    
    -- Insert user record with error handling
    BEGIN
        INSERT INTO public.users (id, email, role)
        VALUES (NEW.id, NEW.email, user_role)
        ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate key errors
        
        -- Log successful creation (optional, remove in production)
        RAISE NOTICE 'Created user record: id=%, email=%, role=%', NEW.id, NEW.email, user_role;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the auth user creation
        RAISE WARNING 'Failed to create user record for %: %', NEW.email, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to manually create user record (fallback for when trigger fails)
CREATE OR REPLACE FUNCTION public.create_user_record(
    user_id UUID,
    user_email TEXT,
    user_role TEXT DEFAULT 'vendor'
)
RETURNS public.users AS $$
DECLARE
    new_user public.users;
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (user_id, user_email, user_role::user_role)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW()
    RETURNING * INTO new_user;
    
    RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

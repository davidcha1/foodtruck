-- Function to auto-confirm users in local development (BEFORE trigger)
CREATE OR REPLACE FUNCTION public.auto_confirm_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-confirm email for local development
    IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at := NOW();
        NEW.confirmed_at := NOW();
        RAISE NOTICE 'Auto-confirming user: %', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create user record (AFTER trigger)
CREATE OR REPLACE FUNCTION public.create_user_profile() 
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Extract role from metadata with better error handling
    BEGIN
        user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'vendor')::user_role;
    EXCEPTION WHEN OTHERS THEN
        user_role := 'vendor'::user_role;
    END;
    
    -- Insert user record with error handling
    BEGIN
        INSERT INTO public.users (id, email, role)
        VALUES (NEW.id, NEW.email, user_role)
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created user profile: id=%, email=%, role=%', NEW.id, NEW.email, user_role;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create BEFORE trigger for auto-confirmation
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- Create AFTER trigger for user profile creation  
CREATE TRIGGER on_auth_user_profile_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

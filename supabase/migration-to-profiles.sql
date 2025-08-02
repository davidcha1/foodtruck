-- Migration script to add profile tables to existing schema
-- This handles existing types gracefully

-- Enable necessary extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop existing views that might conflict
DROP VIEW IF EXISTS public.venue_owners_with_profiles;
DROP VIEW IF EXISTS public.vendors_with_profiles;
DROP VIEW IF EXISTS public.listings_with_details;

-- Create new ENUM types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE business_type AS ENUM ('pub', 'restaurant', 'cafe', 'event_space', 'retail', 'office', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cuisine_type AS ENUM ('asian', 'mexican', 'italian', 'american', 'indian', 'mediterranean', 'vegan', 'dessert', 'beverages', 'fusion', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE electricity_type AS ENUM ('none', '240v', '110v', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Venue Owner Profiles (business-specific information)
CREATE TABLE IF NOT EXISTS public.venue_owner_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT,
    business_type business_type,
    business_registration TEXT, -- ABN, business license number
    business_address TEXT,
    website TEXT,
    social_links TEXT[], -- Instagram, Facebook, TikTok links
    business_hours TEXT, -- e.g., "Mon-Fri 9AM-5PM, Sat 10AM-3PM"
    contact_person TEXT, -- if different from user
    contact_phone TEXT, -- business phone if different
    business_description TEXT,
    profile_photo_url TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Profiles (food truck specific information)
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    food_truck_name TEXT NOT NULL DEFAULT 'My Food Truck',
    cuisine_type cuisine_type,
    food_license_number TEXT,
    truck_description TEXT,
    menu_highlights TEXT[], -- array of popular items
    website TEXT,
    instagram_handle TEXT,
    facebook_page TEXT,
    social_links TEXT[], -- additional social media links
    profile_photo_url TEXT, -- truck photo
    truck_size TEXT, -- e.g., "Small (under 20ft)", "Medium (20-30ft)", "Large (over 30ft)"
    setup_time_minutes INTEGER DEFAULT 30, -- how long to set up
    operating_radius_km INTEGER DEFAULT 50, -- how far they'll travel
    min_booking_value DECIMAL(10, 2), -- minimum booking amount
    special_requirements TEXT, -- any special needs (power requirements, etc.)
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to existing listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS space_size_sqm INTEGER,
ADD COLUMN IF NOT EXISTS max_trucks INTEGER DEFAULT 1;

-- Add new columns to existing amenities table  
ALTER TABLE public.amenities
ADD COLUMN IF NOT EXISTS loading_dock BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS refrigeration_access BOOLEAN NOT NULL DEFAULT FALSE;

-- Add new columns to existing bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS venue_owner_notes TEXT;

-- Add new columns to existing payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payout_id TEXT;

-- Add indexes for new profile tables
CREATE INDEX IF NOT EXISTS idx_venue_owner_profiles_business_type ON public.venue_owner_profiles(business_type);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_cuisine_type ON public.vendor_profiles(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_operating_radius ON public.vendor_profiles(operating_radius_km);

-- Function to create profile based on user role (update existing or create new)
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'venue_owner' THEN
        INSERT INTO public.venue_owner_profiles (user_id)
        VALUES (NEW.id)
        ON CONFLICT (user_id) DO NOTHING;
    ELSIF NEW.role = 'vendor' THEN
        INSERT INTO public.vendor_profiles (user_id, food_truck_name)
        VALUES (NEW.id, 'My Food Truck')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at on new tables
CREATE TRIGGER update_venue_owner_profiles_updated_at BEFORE UPDATE ON public.venue_owner_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON public.vendor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or replace the user profile creation trigger
DROP TRIGGER IF EXISTS create_user_profile_trigger ON public.users;
CREATE TRIGGER create_user_profile_trigger AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Enable RLS on new tables
ALTER TABLE public.venue_owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Venue Owner Profile policies
CREATE POLICY "Venue owners can view their own profile" ON public.venue_owner_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can update their own profile" ON public.venue_owner_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert venue owner profiles" ON public.venue_owner_profiles
    FOR INSERT WITH CHECK (true); -- Handled by trigger

-- Vendor Profile policies
CREATE POLICY "Vendors can view their own profile" ON public.vendor_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profile" ON public.vendor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified vendor profiles" ON public.vendor_profiles
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "System can insert vendor profiles" ON public.vendor_profiles
    FOR INSERT WITH CHECK (true); -- Handled by trigger

-- Create profile photos storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-photos' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own profile photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own profile photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Enhanced: Helper views for common queries

-- View for venue owners with profiles
CREATE OR REPLACE VIEW public.venue_owners_with_profiles AS
SELECT 
    u.*,
    vop.business_name,
    vop.business_type,
    vop.business_registration,
    vop.business_address,
    vop.website,
    vop.social_links,
    vop.business_hours,
    vop.contact_person,
    vop.contact_phone,
    vop.business_description,
    vop.profile_photo_url,
    vop.verification_status
FROM public.users u
JOIN public.venue_owner_profiles vop ON u.id = vop.user_id
WHERE u.role = 'venue_owner';

-- View for vendors with profiles
CREATE OR REPLACE VIEW public.vendors_with_profiles AS
SELECT 
    u.*,
    vp.food_truck_name,
    vp.cuisine_type,
    vp.food_license_number,
    vp.truck_description,
    vp.menu_highlights,
    vp.website,
    vp.instagram_handle,
    vp.facebook_page,
    vp.social_links,
    vp.profile_photo_url,
    vp.truck_size,
    vp.setup_time_minutes,
    vp.operating_radius_km,
    vp.min_booking_value,
    vp.special_requirements,
    vp.verification_status
FROM public.users u
JOIN public.vendor_profiles vp ON u.id = vp.user_id
WHERE u.role = 'vendor';

-- Update the listings view to include new fields
CREATE OR REPLACE VIEW public.listings_with_details AS
SELECT 
    l.*,
    a.running_water,
    a.electricity_type,
    a.gas_supply,
    a.shelter,
    a.toilet_facilities,
    a.wifi,
    a.customer_seating,
    a.waste_disposal,
    a.overnight_parking,
    a.security_cctv,
    a.loading_dock,
    a.refrigeration_access,
    vop.business_name,
    vop.business_type,
    vop.contact_person,
    vop.contact_phone,
    u.first_name || ' ' || u.last_name AS owner_name,
    u.email AS owner_email,
    u.phone AS owner_phone
FROM public.listings l
LEFT JOIN public.amenities a ON l.id = a.listing_id
LEFT JOIN public.users u ON l.owner_id = u.id
LEFT JOIN public.venue_owner_profiles vop ON u.id = vop.user_id;

-- Create profiles for existing users (if any)
INSERT INTO public.venue_owner_profiles (user_id)
SELECT id FROM public.users WHERE role = 'venue_owner'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.vendor_profiles (user_id, food_truck_name)
SELECT id, 'My Food Truck' FROM public.users WHERE role = 'vendor'
ON CONFLICT (user_id) DO NOTHING; 
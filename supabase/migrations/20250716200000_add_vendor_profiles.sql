-- Add missing enum types for profiles
CREATE TYPE business_type AS ENUM ('pub', 'restaurant', 'cafe', 'event_space', 'retail', 'office', 'other');
CREATE TYPE cuisine_type AS ENUM ('asian', 'mexican', 'italian', 'american', 'indian', 'mediterranean', 'vegan', 'dessert', 'beverages', 'fusion', 'other');

-- Venue Owner Profiles (business-specific information)
CREATE TABLE IF NOT EXISTS public.venue_owner_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
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
    food_truck_name TEXT NOT NULL,
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

-- Add missing columns to bookings table for enhanced functionality
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS vendor_notes TEXT,
ADD COLUMN IF NOT EXISTS venue_owner_notes TEXT;

-- Enhanced indexes for profiles
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_cuisine_type ON public.vendor_profiles(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_operating_radius ON public.vendor_profiles(operating_radius_km);
CREATE INDEX IF NOT EXISTS idx_venue_owner_profiles_business_type ON public.venue_owner_profiles(business_type);

-- Triggers for updated_at
CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON public.vendor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_owner_profiles_updated_at BEFORE UPDATE ON public.venue_owner_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_owner_profiles ENABLE ROW LEVEL SECURITY;

-- Vendor profiles policies
CREATE POLICY "Vendors can view their own profile" ON public.vendor_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profile" ON public.vendor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified vendor profiles" ON public.vendor_profiles
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "System can insert vendor profiles" ON public.vendor_profiles
    FOR INSERT WITH CHECK (true);

-- Venue owner profiles policies
CREATE POLICY "Venue owners can view their own profile" ON public.venue_owner_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can update their own profile" ON public.venue_owner_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified venue owner profiles" ON public.venue_owner_profiles
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "System can insert venue owner profiles" ON public.venue_owner_profiles
    FOR INSERT WITH CHECK (true); 
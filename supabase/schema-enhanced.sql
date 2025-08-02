-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create ENUM types for better data consistency
CREATE TYPE user_role AS ENUM ('venue_owner', 'vendor');
CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE stripe_payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');
CREATE TYPE payout_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE electricity_type AS ENUM ('none', '240v', '110v', 'other');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL,
    stripe_connect_id TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL, -- Removed default for global scalability
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326), -- Enhanced: Geospatial column for better location queries
    hourly_rate DECIMAL(10, 2) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    weekly_rate DECIMAL(10, 2),
    min_booking_hours INTEGER NOT NULL DEFAULT 1,
    max_booking_hours INTEGER,
    images TEXT[] DEFAULT '{}',
    status listing_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amenities table
CREATE TABLE IF NOT EXISTS public.amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    running_water BOOLEAN NOT NULL DEFAULT FALSE,
    electricity_type electricity_type NOT NULL DEFAULT 'none',
    gas_supply BOOLEAN NOT NULL DEFAULT FALSE,
    shelter BOOLEAN NOT NULL DEFAULT FALSE,
    toilet_facilities BOOLEAN NOT NULL DEFAULT FALSE,
    wifi BOOLEAN NOT NULL DEFAULT FALSE,
    customer_seating BOOLEAN NOT NULL DEFAULT FALSE,
    waste_disposal BOOLEAN NOT NULL DEFAULT FALSE,
    overnight_parking BOOLEAN NOT NULL DEFAULT FALSE,
    security_cctv BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(listing_id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours INTEGER NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    cancellation_reason TEXT, -- Enhanced: For customer support and analytics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Enhanced: Prevent double bookings
    CONSTRAINT unique_booking_slot UNIQUE (listing_id, booking_date, start_time, end_time)
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    vendor_payout DECIMAL(10, 2) NOT NULL,
    payment_status stripe_payment_status NOT NULL DEFAULT 'pending',
    payout_status payout_status NOT NULL DEFAULT 'pending',
    stripe_transfer_id TEXT,
    stripe_refund_id TEXT, -- Enhanced: For refund tracking
    stripe_payout_id TEXT, -- Enhanced: For payout tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- Enhanced indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location_gist ON public.listings USING GIST(location); -- Enhanced: Geospatial index
CREATE INDEX IF NOT EXISTS idx_listings_location_btree ON public.listings(latitude, longitude); -- Keep for backward compatibility
CREATE INDEX IF NOT EXISTS idx_listings_city_state ON public.listings(city, state); -- Enhanced: For location searches
CREATE INDEX IF NOT EXISTS idx_listings_rates ON public.listings(daily_rate, hourly_rate); -- Enhanced: For price filtering
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON public.bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON public.bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON public.bookings(booking_date, start_time, end_time); -- Enhanced: For availability checks
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status, payout_status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically update location from lat/lng
CREATE OR REPLACE FUNCTION update_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_MakePoint(NEW.longitude, NEW.latitude);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amenities_updated_at BEFORE UPDATE ON public.amenities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced: Trigger to automatically update location column
CREATE TRIGGER update_listings_location BEFORE INSERT OR UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_location_from_coordinates();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Enhanced: Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON public.listings
    FOR SELECT USING (status = 'active');

-- Enhanced: Allow venue owners to view their own listings regardless of status
CREATE POLICY "Venue owners can view their own listings" ON public.listings
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Venue owners can insert their own listings" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Venue owners can update their own listings" ON public.listings
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Venue owners can delete their own listings" ON public.listings
    FOR DELETE USING (auth.uid() = owner_id);

-- Amenities policies
CREATE POLICY "Anyone can view amenities for active listings" ON public.amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE listings.id = amenities.listing_id 
            AND listings.status = 'active'
        )
    );

-- Enhanced: Allow venue owners to view amenities for their own listings
CREATE POLICY "Venue owners can view amenities for their listings" ON public.amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE listings.id = amenities.listing_id 
            AND listings.owner_id = auth.uid()
        )
    );

CREATE POLICY "Venue owners can manage amenities for their listings" ON public.amenities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE listings.id = amenities.listing_id 
            AND listings.owner_id = auth.uid()
        )
    );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = vendor_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.listings WHERE id = listing_id
        )
    );

CREATE POLICY "Vendors can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = vendor_id);

-- Enhanced: Allow vendors to cancel their own bookings
CREATE POLICY "Vendors can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Venue owners can update booking status" ON public.bookings
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT owner_id FROM public.listings WHERE id = listing_id
        )
    );

-- Allow public read access for availability checking
CREATE POLICY "Anyone can view booking availability" ON public.bookings
    FOR SELECT USING (true);

-- Payments policies
CREATE POLICY "Users can view payments for their bookings" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = payments.booking_id 
            AND (
                bookings.vendor_id = auth.uid() OR 
                bookings.listing_id IN (
                    SELECT id FROM public.listings WHERE owner_id = auth.uid()
                )
            )
        )
    );

-- Enhanced: Allow system to insert payments
CREATE POLICY "System can manage payments" ON public.payments
    FOR ALL USING (true);

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing images
CREATE POLICY "Anyone can view listing images" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-images' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own listing images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'listing-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own listing images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'listing-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Enhanced: Helper views for common queries

-- View for listings with all details
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
    u.first_name || ' ' || u.last_name AS owner_name,
    u.email AS owner_email,
    u.phone AS owner_phone
FROM public.listings l
LEFT JOIN public.amenities a ON l.id = a.listing_id
LEFT JOIN public.users u ON l.owner_id = u.id;

-- Function for radius-based location search
CREATE OR REPLACE FUNCTION search_listings_by_location(
    search_lat DECIMAL,
    search_lng DECIMAL,
    radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
    listing_id UUID,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        ROUND(
            ST_Distance(
                ST_MakePoint(search_lng, search_lat)::geography,
                l.location
            ) / 1000, 2
        ) as distance_km
    FROM public.listings l
    WHERE l.status = 'active'
      AND ST_DWithin(
          ST_MakePoint(search_lng, search_lat)::geography,
          l.location,
          radius_km * 1000
      )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check listing availability
CREATE OR REPLACE FUNCTION check_listing_availability(
    listing_uuid UUID,
    check_date DATE,
    start_time_param TIME,
    end_time_param TIME
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM public.bookings
    WHERE listing_id = listing_uuid
      AND booking_date = check_date
      AND status IN ('pending', 'confirmed')
      AND (
          (start_time_param >= start_time AND start_time_param < end_time) OR
          (end_time_param > start_time AND end_time_param <= end_time) OR
          (start_time_param <= start_time AND end_time_param >= end_time)
      );
    
    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced: Populate location column for existing data (run after initial data insertion)
-- UPDATE public.listings SET location = ST_MakePoint(longitude, latitude) WHERE location IS NULL; 
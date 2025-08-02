-- Updated Schema based on actual Supabase database
-- Generated from JSON schema analysis

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom enums
CREATE TYPE user_role AS ENUM ('venue_owner', 'vendor');
CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE stripe_payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');
CREATE TYPE payout_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE business_type AS ENUM ('pub', 'restaurant', 'cafe', 'event_space', 'retail', 'office', 'other');
CREATE TYPE cuisine_type AS ENUM ('asian', 'mexican', 'italian', 'american', 'indian', 'mediterranean', 'vegan', 'dessert', 'beverages', 'fusion', 'other');
CREATE TYPE electricity_type AS ENUM ('none', '240v', '110v', 'other');

-- Create users table
CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    role user_role NOT NULL,
    stripe_connect_id text,
    first_name text,
    last_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create listings table
CREATE TABLE public.listings (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    owner_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    location geometry(Point,4326),
    hourly_rate numeric NOT NULL,
    daily_rate numeric NOT NULL,
    weekly_rate numeric,
    min_booking_hours integer NOT NULL DEFAULT 1,
    max_booking_hours integer,
    images text[] DEFAULT '{}'::text[],
    status listing_status NOT NULL DEFAULT 'active'::listing_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    space_size_sqm integer,
    max_trucks integer DEFAULT 1
);

-- Create amenities table
CREATE TABLE public.amenities (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    listing_id uuid NOT NULL,
    running_water boolean NOT NULL DEFAULT false,
    electricity_type electricity_type NOT NULL DEFAULT 'none'::electricity_type,
    gas_supply boolean NOT NULL DEFAULT false,
    shelter boolean NOT NULL DEFAULT false,
    toilet_facilities boolean NOT NULL DEFAULT false,
    wifi boolean NOT NULL DEFAULT false,
    customer_seating boolean NOT NULL DEFAULT false,
    waste_disposal boolean NOT NULL DEFAULT false,
    overnight_parking boolean NOT NULL DEFAULT false,
    security_cctv boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    loading_dock boolean NOT NULL DEFAULT false,
    refrigeration_access boolean NOT NULL DEFAULT false
);

-- Create bookings table
CREATE TABLE public.bookings (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    listing_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    booking_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    total_hours integer NOT NULL,
    total_cost numeric NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending'::booking_status,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending'::payment_status_enum,
    stripe_payment_intent_id text,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    special_requests text,
    venue_owner_notes text
);

-- Create payments table
CREATE TABLE public.payments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    booking_id uuid NOT NULL,
    stripe_payment_intent_id text NOT NULL,
    amount numeric NOT NULL,
    platform_fee numeric NOT NULL,
    vendor_payout numeric NOT NULL,
    payment_status stripe_payment_status NOT NULL DEFAULT 'pending'::stripe_payment_status,
    payout_status payout_status NOT NULL DEFAULT 'pending'::payout_status,
    stripe_transfer_id text,
    stripe_refund_id text,
    stripe_payout_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create vendor_profiles table
CREATE TABLE public.vendor_profiles (
    user_id uuid NOT NULL,
    food_truck_name text NOT NULL DEFAULT 'My Food Truck'::text,
    cuisine_type cuisine_type,
    food_license_number text,
    truck_description text,
    menu_highlights text[],
    website text,
    instagram_handle text,
    facebook_page text,
    social_links text[],
    profile_photo_url text,
    truck_size text,
    setup_time_minutes integer DEFAULT 30,
    operating_radius_km integer DEFAULT 50,
    min_booking_value numeric,
    special_requirements text,
    verification_status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create venue_owner_profiles table
CREATE TABLE public.venue_owner_profiles (
    user_id uuid NOT NULL,
    business_name text,
    business_type business_type,
    business_registration text,
    business_address text,
    website text,
    social_links text[],
    business_hours text,
    contact_person text,
    contact_phone text,
    business_description text,
    profile_photo_url text,
    verification_status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create primary keys
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.listings ADD CONSTRAINT listings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.amenities ADD CONSTRAINT amenities_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.bookings ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.vendor_profiles ADD CONSTRAINT vendor_profiles_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY public.venue_owner_profiles ADD CONSTRAINT venue_owner_profiles_pkey PRIMARY KEY (user_id);

-- Create unique constraints
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.amenities ADD CONSTRAINT amenities_listing_id_key UNIQUE (listing_id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_booking_id_key UNIQUE (booking_id);
ALTER TABLE ONLY public.bookings ADD CONSTRAINT unique_booking_slot UNIQUE (listing_id, booking_date, start_time, end_time);

-- Create foreign key constraints
ALTER TABLE ONLY public.listings ADD CONSTRAINT listings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.amenities ADD CONSTRAINT amenities_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);
ALTER TABLE ONLY public.bookings ADD CONSTRAINT bookings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);
ALTER TABLE ONLY public.bookings ADD CONSTRAINT bookings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);
ALTER TABLE ONLY public.vendor_profiles ADD CONSTRAINT vendor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.venue_owner_profiles ADD CONSTRAINT venue_owner_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Create indexes
CREATE INDEX idx_listings_city_state ON public.listings USING btree (city, state);
CREATE INDEX idx_listings_location_btree ON public.listings USING btree (latitude, longitude);
CREATE INDEX idx_listings_location_gist ON public.listings USING gist (location);
CREATE INDEX idx_listings_owner_id ON public.listings USING btree (owner_id);
CREATE INDEX idx_listings_rates ON public.listings USING btree (daily_rate, hourly_rate);
CREATE INDEX idx_listings_status ON public.listings USING btree (status);
CREATE INDEX idx_bookings_date ON public.bookings USING btree (booking_date);
CREATE INDEX idx_bookings_date_time ON public.bookings USING btree (booking_date, start_time, end_time);
CREATE INDEX idx_bookings_listing_id ON public.bookings USING btree (listing_id);
CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);
CREATE INDEX idx_bookings_vendor_id ON public.bookings USING btree (vendor_id);
CREATE INDEX idx_payments_booking_id ON public.payments USING btree (booking_id);
CREATE INDEX idx_payments_status ON public.payments USING btree (payment_status, payout_status);
CREATE INDEX idx_vendor_profiles_cuisine_type ON public.vendor_profiles USING btree (cuisine_type);
CREATE INDEX idx_vendor_profiles_operating_radius ON public.vendor_profiles USING btree (operating_radius_km);
CREATE INDEX idx_venue_owner_profiles_business_type ON public.venue_owner_profiles USING btree (business_type);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_location_from_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_MakePoint(NEW.longitude, NEW.latitude);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_listing_availability(
    listing_uuid uuid,
    check_date date,
    start_time_param time,
    end_time_param time
)
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_listings_by_location(
    search_lat numeric,
    search_lng numeric,
    radius_km integer
)
RETURNS TABLE(id uuid, distance_km numeric) AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_location
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_location_from_coordinates();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amenities_updated_at
    BEFORE UPDATE ON public.amenities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at
    BEFORE UPDATE ON public.vendor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_owner_profiles_updated_at
    BEFORE UPDATE ON public.venue_owner_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_owner_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update own profile  
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Anyone can view active listings
CREATE POLICY "Anyone can view active listings" ON public.listings
    FOR SELECT USING (status = 'active'::listing_status);

-- Venue owners can manage their own listings
CREATE POLICY "Venue owners can view their own listings" ON public.listings
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Venue owners can insert their own listings" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Venue owners can update their own listings" ON public.listings
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Venue owners can delete their own listings" ON public.listings
    FOR DELETE USING (auth.uid() = owner_id);

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = vendor_id OR 
        auth.uid() IN (
            SELECT listings.owner_id 
            FROM listings 
            WHERE listings.id = bookings.listing_id
        )
    );

-- Vendors can create bookings
CREATE POLICY "Vendors can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = vendor_id);

-- Vendors can update their own bookings
CREATE POLICY "Vendors can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = vendor_id);

-- Venue owners can update booking status
CREATE POLICY "Venue owners can update booking status" ON public.bookings
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT listings.owner_id 
            FROM listings 
            WHERE listings.id = bookings.listing_id
        )
    );

-- Anyone can view amenities for active listings
CREATE POLICY "Anyone can view amenities for active listings" ON public.amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = amenities.listing_id 
            AND listings.status = 'active'::listing_status
        )
    );

-- Venue owners can manage amenities for their listings
CREATE POLICY "Venue owners can view amenities for their listings" ON public.amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = amenities.listing_id 
            AND listings.owner_id = auth.uid()
        )
    );

CREATE POLICY "Venue owners can manage amenities for their listings" ON public.amenities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = amenities.listing_id 
            AND listings.owner_id = auth.uid()
        )
    );

-- Users can view payments for their bookings
CREATE POLICY "Users can view payments for their bookings" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = payments.booking_id 
            AND (
                bookings.vendor_id = auth.uid() OR 
                bookings.listing_id IN (
                    SELECT listings.id 
                    FROM listings 
                    WHERE listings.owner_id = auth.uid()
                )
            )
        )
    );

-- System can manage payments
CREATE POLICY "System can manage payments" ON public.payments
    FOR ALL USING (true);

-- Vendor profile policies
CREATE POLICY "Anyone can view verified vendor profiles" ON public.vendor_profiles
    FOR SELECT USING (verification_status = 'verified'::text);

CREATE POLICY "Vendors can view their own profile" ON public.vendor_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profile" ON public.vendor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert vendor profiles" ON public.vendor_profiles
    FOR INSERT WITH CHECK (true);

-- Venue owner profile policies
CREATE POLICY "Venue owners can view their own profile" ON public.venue_owner_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can update their own profile" ON public.venue_owner_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert venue owner profiles" ON public.venue_owner_profiles
    FOR INSERT WITH CHECK (true); 
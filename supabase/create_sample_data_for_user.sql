-- Script to create sample data for a venue owner
-- Replace the user_id with the actual venue owner's ID

-- Get the venue owner user (you can replace the email with the actual user's email)
DO $$
DECLARE
    venue_owner_id UUID;
    vendor1_id UUID := '550e8400-e29b-41d4-a716-446655440002'; -- From existing seed data
    vendor2_id UUID := '550e8400-e29b-41d4-a716-446655440003'; -- From existing seed data
    listing1_id UUID := uuid_generate_v4();
    listing2_id UUID := uuid_generate_v4();
BEGIN
    -- Find the venue owner by email (update this email to match the signed-up user)
    SELECT id INTO venue_owner_id 
    FROM public.users 
    WHERE role = 'venue_owner' 
    AND (email LIKE '%venue.owner%' OR email = 'venue.owner@test.com')
    LIMIT 1;
    
    -- If no venue owner found, exit
    IF venue_owner_id IS NULL THEN
        RAISE NOTICE 'No venue owner found. Please sign up first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Creating sample data for venue owner: %', venue_owner_id;
    
    -- Create venue owner profile if it doesn't exist
    INSERT INTO public.venue_owner_profiles (
        user_id, business_name, business_type, business_registration, 
        business_address, website, business_hours, contact_person, 
        business_description, verification_status
    ) VALUES (
        venue_owner_id, 
        'Your Test Venue', 
        'event_space', 
        'TEST123456', 
        '123 Test Street, Manchester, M1 1AA', 
        'https://yourtestevenue.com', 
        'Mon-Sun 8AM-10PM', 
        'Test Owner', 
        'A fantastic test venue for food trucks and events.', 
        'verified'
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Create sample listings for the venue owner
    INSERT INTO public.listings (
        id, owner_id, title, description, address, city, state, postal_code, 
        country, latitude, longitude, hourly_rate, daily_rate, weekly_rate, 
        min_booking_hours, max_booking_hours, images, status
    ) VALUES 
    (
        listing1_id, venue_owner_id, 
        'Prime City Centre Location', 
        'Beautiful space in Manchester city centre with excellent foot traffic. Perfect for food trucks.',
        '123 Test Street', 'Manchester', 'Greater Manchester', 'M1 1AA', 'United Kingdom',
        53.4808, -2.2426, 30.00, 200.00, 1200.00, 4, 12,
        ARRAY['https://example.com/venue1.jpg'], 'active'
    ),
    (
        listing2_id, venue_owner_id,
        'Riverside Food Court',
        'Spacious area by the canal with beautiful views. High footfall during peak hours.',
        '456 Canal Street', 'Manchester', 'Greater Manchester', 'M1 2BB', 'United Kingdom',
        53.4825, -2.2410, 25.00, 180.00, 1000.00, 6, 10,
        ARRAY['https://example.com/venue2.jpg'], 'active'
    );
    
    -- Create amenities for the listings
    INSERT INTO public.amenities (
        listing_id, running_water, electricity_type, gas_supply, shelter, 
        toilet_facilities, wifi, customer_seating, waste_disposal, 
        overnight_parking, security_cctv
    ) VALUES 
    (listing1_id, true, '240v', true, true, true, true, true, true, false, true),
    (listing2_id, true, '240v', false, false, true, true, true, true, true, true);
    
    -- Create sample bookings (mix of past and future dates)
    INSERT INTO public.bookings (
        id, listing_id, vendor_id, booking_date, start_time, end_time, 
        total_hours, total_cost, status, payment_status, vendor_notes, venue_owner_notes
    ) VALUES 
    -- Recent completed bookings
    (uuid_generate_v4(), listing1_id, vendor1_id, CURRENT_DATE - INTERVAL '5 days', '11:00', '16:00', 5, 150.00, 'completed', 'paid', 'Great location!', 'Excellent vendor'),
    (uuid_generate_v4(), listing2_id, vendor2_id, CURRENT_DATE - INTERVAL '3 days', '12:00', '18:00', 6, 150.00, 'completed', 'paid', 'Perfect spot', 'Very professional'),
    (uuid_generate_v4(), listing1_id, vendor1_id, CURRENT_DATE - INTERVAL '1 day', '17:00', '22:00', 5, 150.00, 'completed', 'paid', 'Busy evening!', 'Great turnout'),
    
    -- Confirmed future bookings
    (uuid_generate_v4(), listing1_id, vendor2_id, CURRENT_DATE + INTERVAL '2 days', '11:00', '16:00', 5, 150.00, 'confirmed', 'pending', 'Looking forward to it!', 'Confirmed'),
    (uuid_generate_v4(), listing2_id, vendor1_id, CURRENT_DATE + INTERVAL '5 days', '12:00', '20:00', 8, 200.00, 'confirmed', 'pending', 'Full day service', 'All set!'),
    
    -- Pending bookings awaiting approval
    (uuid_generate_v4(), listing1_id, vendor1_id, CURRENT_DATE + INTERVAL '7 days', '10:00', '15:00', 5, 150.00, 'pending', 'pending', 'Weekend special', null),
    (uuid_generate_v4(), listing2_id, vendor2_id, CURRENT_DATE + INTERVAL '10 days', '16:00', '21:00', 5, 125.00, 'pending', 'pending', 'Evening rush', null),
    (uuid_generate_v4(), listing1_id, vendor1_id, CURRENT_DATE + INTERVAL '12 days', '09:00', '17:00', 8, 200.00, 'pending', 'pending', 'All day event', null);
    
    -- Create payment records for completed bookings
    INSERT INTO public.payments (
        id, booking_id, stripe_payment_intent_id, amount, platform_fee, 
        vendor_payout, payment_status, payout_status
    )
    SELECT 
        uuid_generate_v4(),
        b.id,
        'pi_test_' || substr(b.id::text, 1, 8),
        b.total_cost,
        b.total_cost * 0.1, -- 10% platform fee
        b.total_cost * 0.9, -- 90% vendor payout
        'succeeded',
        'paid'
    FROM public.bookings b 
    WHERE b.status = 'completed'
    AND b.listing_id IN (listing1_id, listing2_id);
    
    RAISE NOTICE 'Sample data created successfully! Listings: %, %', listing1_id, listing2_id;
    
END $$; 
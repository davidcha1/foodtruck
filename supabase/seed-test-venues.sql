-- Seed test venues for FoodTruck Hub testing
-- Run this script to add sample venues to the database
-- This script handles duplicates gracefully

-- Insert test venue owner users (handle duplicates)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'sarah.pub@example.com', NOW(), NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'marcus.restaurant@example.com', NOW(), NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'lily.cafe@example.com', NOW(), NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'james.event@example.com', NOW(), NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'emma.retail@example.com', NOW(), NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'david.office@example.com', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding user records (handle duplicates)
INSERT INTO public.users (id, email, role, first_name, last_name, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'sarah.pub@example.com', 'venue_owner', 'Sarah', 'Mitchell', '+44 7700 900123'),
('22222222-2222-2222-2222-222222222222', 'marcus.restaurant@example.com', 'venue_owner', 'Marcus', 'Johnson', '+44 7700 900124'),
('33333333-3333-3333-3333-333333333333', 'lily.cafe@example.com', 'venue_owner', 'Lily', 'Chen', '+44 7700 900125'),
('44444444-4444-4444-4444-444444444444', 'james.event@example.com', 'venue_owner', 'James', 'Wilson', '+44 7700 900126'),
('55555555-5555-5555-5555-555555555555', 'emma.retail@example.com', 'venue_owner', 'Emma', 'Davies', '+44 7700 900127'),
('66666666-6666-6666-6666-666666666666', 'david.office@example.com', 'venue_owner', 'David', 'Thompson', '+44 7700 900128')
ON CONFLICT (id) DO NOTHING;

-- Insert venue owner profiles (handle duplicates)
INSERT INTO public.venue_owner_profiles (
    user_id, business_name, business_type, business_registration, business_address, 
    website, business_hours, contact_person, contact_phone, business_description, verification_status
) VALUES
('11111111-1111-1111-1111-111111111111', 'The Crown & Anchor', 'pub', 'GB123456789', '45 High Street, Camden, London NW1 7JL', 
 'https://crownandanchor.co.uk', 'Mon-Thu 11AM-11PM, Fri-Sat 11AM-12AM, Sun 12PM-10:30PM', 'Sarah Mitchell', '+44 20 7485 1234', 
 'Historic gastropub in Camden with a large outdoor courtyard perfect for food trucks. Regular live music events and bustling nightlife.', 'verified'),

('22222222-2222-2222-2222-222222222222', 'Bella Vista Restaurant', 'restaurant', 'GB234567890', '12 Queen Street, Bath BA1 1HE', 
 'https://bellavistabath.co.uk', 'Tue-Sat 5PM-10PM, Sun 12PM-8PM', 'Marcus Johnson', '+44 1225 123456', 
 'Upscale Italian restaurant with spacious outdoor terrace overlooking Bath. Perfect for complementary food truck partnerships during events.', 'verified'),

('33333333-3333-3333-3333-333333333333', 'Moonbeam Coffee House', 'cafe', 'GB345678901', '78 North Street, Brighton BN1 1ZA', 
 'https://moonbeamcoffee.com', 'Mon-Fri 7AM-5PM, Sat-Sun 8AM-6PM', 'Lily Chen', '+44 1273 987654', 
 'Artisan coffee house near Brighton seafront with large outdoor seating area. Popular with locals and tourists, ideal for food truck collaborations.', 'verified'),

('44444444-4444-4444-4444-444444444444', 'Riverside Event Space', 'event_space', 'GB456789012', 'Waterfront Way, Manchester M50 3AZ', 
 'https://riversideevents.co.uk', 'By appointment - events 7 days a week', 'James Wilson', '+44 161 234 5678', 
 'Premier outdoor event venue along Manchester Ship Canal. Hosts weddings, corporate events, and festivals with dedicated food truck zones.', 'verified'),

('55555555-5555-5555-5555-555555555555', 'Vintage Market Square', 'retail', 'GB567890123', '15-20 Brick Lane, London E1 6QL', 
 'https://vintagemarket.london', 'Thu-Sun 10AM-6PM', 'Emma Davies', '+44 20 7377 9876', 
 'Trendy vintage market in Brick Lane with dedicated outdoor food court area. High foot traffic from shoppers and tourists seeking authentic street food.', 'verified'),

('66666666-6666-6666-6666-666666666666', 'TechHub Business Park', 'office', 'GB678901234', '50 Innovation Drive, Cambridge CB4 0WS', 
 'https://techhub-cambridge.com', 'Mon-Fri 8AM-6PM', 'David Thompson', '+44 1223 345678', 
 'Modern business park with outdoor plaza and lunch areas. 2000+ employees seeking convenient, quality lunch options from rotating food trucks.', 'verified')
ON CONFLICT (user_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    business_registration = EXCLUDED.business_registration,
    business_address = EXCLUDED.business_address,
    website = EXCLUDED.website,
    business_hours = EXCLUDED.business_hours,
    contact_person = EXCLUDED.contact_person,
    contact_phone = EXCLUDED.contact_phone,
    business_description = EXCLUDED.business_description,
    verification_status = EXCLUDED.verification_status,
    updated_at = NOW();

-- Insert listings (handle duplicates)
INSERT INTO public.listings (
    id, owner_id, title, description, address, city, state, postal_code, country,
    latitude, longitude, hourly_rate, daily_rate, weekly_rate, min_booking_hours, max_booking_hours,
    space_size_sqm, max_trucks, status, images
) VALUES

-- Central London Food Court
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
 'Canary Wharf Corporate Plaza', 
 'Premium outdoor space in the heart of London''s financial district. Perfect for lunch service with high foot traffic from office workers. Excellent visibility and accessibility.',
 'Canary Wharf', 'London', 'Greater London', 'E14 5AB', 'United Kingdom',
 51.5074, -0.0278, 35.00, 250.00, 1500.00, 4, 12, 200, 2, 'active',
 ARRAY[
   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop'
 ]),

-- East London Pop-up Market
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
 'Shoreditch Street Food Market',
 'Trendy covered market space in vibrant Shoreditch. Popular with young professionals and tourists. Weekend events and evening food scene.',
 '15 Brick Lane', 'London', 'Greater London', 'E1 6QL', 'United Kingdom',
 51.5211, -0.0712, 30.00, 220.00, 1300.00, 4, 14, 150, 3, 'active',
 ARRAY[
   'https://images.unsplash.com/photo-1567129937968-cdad8f1c8566?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
 ]),

-- Greenwich University Campus
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333',
 'Greenwich University Food Court',
 'University campus setting with large outdoor courtyard. High student foot traffic during term time. Popular for breakfast, lunch and dinner service.',
 'Old Royal Naval College', 'Greenwich', 'Greater London', 'SE10 9LS', 'United Kingdom',
 51.4826, -0.0077, 25.00, 180.00, 1100.00, 3, 16, 300, 4, 'active',
 ARRAY[
   'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1567226475328-9d6baaf565cf?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
 ]),

-- South London Business Park
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444',
 'Croydon Business Quarter',
 'Modern business park with dedicated food truck zone. Serves 1500+ office workers seeking convenient lunch options. Ample parking and power supply.',
 'George Street', 'Croydon', 'Greater London', 'CR0 1LA', 'United Kingdom',
 51.3728, -0.0982, 28.00, 200.00, 1200.00, 4, 10, 180, 2, 'active',
 ARRAY[
   'https://images.unsplash.com/photo-1572040543086-ca1b6ccd1b3b?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop'
 ]),

-- Brighton Marina
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555',
 'Brighton Marina Boardwalk',
 'Scenic waterfront location with beautiful marina views. Popular tourist destination with year-round foot traffic. Perfect for seaside dining experience.',
 'Marina Way', 'Brighton', 'East Sussex', 'BN2 5UF', 'United Kingdom',
 50.8225, -0.0982, 32.00, 240.00, 1400.00, 4, 14, 250, 3, 'active',
 ARRAY[
   'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
 ]),

-- Cambridge Tech Hub
('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666',
 'Cambridge Innovation Quarter',
 'High-tech business park with outdoor plaza areas. Surrounded by tech companies and start-ups. Modern facilities with reliable power and waste management.',
 'Innovation Drive', 'Cambridge', 'Cambridgeshire', 'CB4 0WS', 'United Kingdom',
 52.2053, 0.1218, 30.00, 210.00, 1250.00, 4, 12, 220, 2, 'active',
 ARRAY[
   'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'
 ])

ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    postal_code = EXCLUDED.postal_code,
    country = EXCLUDED.country,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    hourly_rate = EXCLUDED.hourly_rate,
    daily_rate = EXCLUDED.daily_rate,
    weekly_rate = EXCLUDED.weekly_rate,
    min_booking_hours = EXCLUDED.min_booking_hours,
    max_booking_hours = EXCLUDED.max_booking_hours,
    space_size_sqm = EXCLUDED.space_size_sqm,
    max_trucks = EXCLUDED.max_trucks,
    status = EXCLUDED.status,
    images = EXCLUDED.images,
    updated_at = NOW();

-- Insert amenities for each listing (handle duplicates)
INSERT INTO public.amenities (
    listing_id, running_water, electricity_type, gas_supply, shelter, toilet_facilities,
    wifi, customer_seating, waste_disposal, overnight_parking, security_cctv,
    loading_dock, refrigeration_access
) VALUES
-- Camden Pub Courtyard
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, '240v', true, true, true, true, true, true, false, true, false, true),

-- Bath Restaurant Terrace  
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, '240v', false, true, true, true, true, true, false, true, false, true),

-- Brighton Coffee Spot
('cccccccc-cccc-cccc-cccc-cccccccccccc', true, '240v', false, false, true, true, true, true, false, false, false, false),

-- Manchester Event Venue
('dddddddd-dddd-dddd-dddd-dddddddddddd', true, '240v', true, false, true, true, false, true, true, true, true, true),

-- Brick Lane Market
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, '240v', false, true, true, true, true, true, false, true, false, false),

-- Cambridge Tech Park
('ffffffff-ffff-ffff-ffff-ffffffffffff', true, '240v', false, true, true, true, true, true, true, true, true, false)
ON CONFLICT (listing_id) DO UPDATE SET
    running_water = EXCLUDED.running_water,
    electricity_type = EXCLUDED.electricity_type,
    gas_supply = EXCLUDED.gas_supply,
    shelter = EXCLUDED.shelter,
    toilet_facilities = EXCLUDED.toilet_facilities,
    wifi = EXCLUDED.wifi,
    customer_seating = EXCLUDED.customer_seating,
    waste_disposal = EXCLUDED.waste_disposal,
    overnight_parking = EXCLUDED.overnight_parking,
    security_cctv = EXCLUDED.security_cctv,
    loading_dock = EXCLUDED.loading_dock,
    refrigeration_access = EXCLUDED.refrigeration_access,
    updated_at = NOW();

-- Update location geography column for spatial queries
UPDATE public.listings 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE location IS NULL;

-- Verify the data
SELECT 
    l.title,
    l.city,
    l.hourly_rate,
    l.daily_rate,
    u.first_name || ' ' || u.last_name as owner_name,
    vop.business_name,
    vop.business_type
FROM public.listings l
JOIN public.users u ON l.owner_id = u.id
JOIN public.venue_owner_profiles vop ON u.id = vop.user_id
ORDER BY l.city; 
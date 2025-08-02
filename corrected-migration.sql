-- Corrected Cloud Migration Script for FoodTruck Hub
-- Run this in your Supabase dashboard SQL editor

-- Step 1: Create auth.users records first (these need to exist before public.users)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sarah.market@example.com', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'james.events@example.com', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'emma.cafe@example.com', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'mike.waterfront@example.com', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'lisa.heritage@example.com', NOW(), NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440001', 'vendor.taco@example.com', NOW(), NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'vendor.burger@example.com', NOW(), NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'vendor.pizza@example.com', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create public user records for venue owners
INSERT INTO public.users (id, email, role, first_name, last_name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'sarah.market@example.com', 'venue_owner', 'Sarah', 'Mitchell', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'james.events@example.com', 'venue_owner', 'James', 'Thompson', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'emma.cafe@example.com', 'venue_owner', 'Emma', 'Wilson', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'mike.waterfront@example.com', 'venue_owner', 'Michael', 'Brown', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'lisa.heritage@example.com', 'venue_owner', 'Lisa', 'Davis', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440001', 'vendor.taco@example.com', 'vendor', 'Carlos', 'Rodriguez', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'vendor.burger@example.com', 'vendor', 'Tom', 'Anderson', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'vendor.pizza@example.com', 'vendor', 'Marco', 'Rossi', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create venue owner profiles
INSERT INTO public.venue_owner_profiles (user_id, business_name, business_type, verification_status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'London Markets Ltd', 'event_space', 'verified'),
('550e8400-e29b-41d4-a716-446655440002', 'Manchester Events', 'event_space', 'verified'),
('550e8400-e29b-41d4-a716-446655440003', 'Birmingham Business Park', 'event_space', 'verified'),
('550e8400-e29b-41d4-a716-446655440004', 'Liverpool Waterfront', 'event_space', 'verified'),
('550e8400-e29b-41d4-a716-446655440005', 'Edinburgh Heritage', 'event_space', 'verified')
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Create vendor profiles
INSERT INTO public.vendor_profiles (user_id, food_truck_name, cuisine_type, verification_status) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Carlos Tacos', 'mexican', 'verified'),
('660e8400-e29b-41d4-a716-446655440002', 'Toms Burger Joint', 'american', 'verified'),
('660e8400-e29b-41d4-a716-446655440003', 'Marcos Pizza Express', 'italian', 'verified')
ON CONFLICT (user_id) DO NOTHING;

-- Step 5: Create sample listings
INSERT INTO public.listings (
  id, owner_id, title, description, address, city, state, postal_code, country,
  latitude, longitude, hourly_rate, daily_rate, weekly_rate, min_booking_hours, max_booking_hours,
  status, created_at, updated_at
) VALUES 
  ('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', 'Camden Market Food Court', 'Prime location in the heart of Camden Market. High foot traffic area perfect for food trucks. Access to electricity and water available.', 'Camden Lock Place', 'London', 'Greater London', 'NW1 8AF', 'UK', 51.5417, -0.1446, 25.00, 200.00, 1200.00, 4, 12, 'active', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440002', 'Northern Quarter Street Food Hub', 'Trendy area in Manchester''s Northern Quarter. Popular with young professionals and students. Covered area available.', 'Stevenson Square', 'Manchester', 'Greater Manchester', 'M1 1FR', 'UK', 53.4831, -2.2344, 20.00, 160.00, 1000.00, 3, 10, 'active', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440003', 'Bullring Shopping Centre Plaza', 'High-traffic location next to Birmingham''s main shopping centre. Perfect for lunch crowds and weekend shoppers.', 'Bullring Shopping Centre', 'Birmingham', 'West Midlands', 'B5 4BU', 'UK', 52.4775, -1.8936, 22.00, 180.00, 1100.00, 4, 12, 'active', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440004', 'Albert Dock Waterfront', 'Historic waterfront location with stunning views. Popular tourist destination with high foot traffic.', 'Albert Dock', 'Liverpool', 'Merseyside', 'L3 4AA', 'UK', 53.4008, -2.9944, 28.00, 220.00, 1400.00, 4, 12, 'active', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440005', 'Royal Mile Food Festival', 'Historic location on Edinburgh''s Royal Mile. Tourist hotspot with excellent visibility and foot traffic.', 'Royal Mile', 'Edinburgh', 'Scotland', 'EH1 1RE', 'UK', 55.9533, -3.1883, 30.00, 240.00, 1500.00, 4, 12, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 6: Create amenities for each listing
INSERT INTO public.amenities (
  listing_id, running_water, electricity_type, gas_supply, shelter, 
  toilet_facilities, wifi, customer_seating, waste_disposal, 
  overnight_parking, security_cctv
) VALUES 
('11111111-1111-1111-1111-111111111111', true, '240v', true, true, true, true, true, true, false, true),
('22222222-2222-2222-2222-222222222222', true, '240v', false, true, true, true, true, true, false, true),
('33333333-3333-3333-3333-333333333333', true, '240v', true, false, true, true, true, true, true, true),
('44444444-4444-4444-4444-444444444444', true, '240v', false, false, true, true, true, true, false, true),
('55555555-5555-5555-5555-555555555555', true, '240v', true, true, true, true, true, true, false, true)
ON CONFLICT (listing_id) DO NOTHING;

-- Step 7: Create sample bookings
INSERT INTO public.bookings (
  id, listing_id, vendor_id, booking_date, start_time, end_time, 
  total_hours, total_cost, status, payment_status, vendor_notes, venue_owner_notes
) VALUES 
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '5 days', '11:00', '16:00', 5, 125.00, 'completed', 'paid', 'Great location!', 'Excellent vendor'),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '3 days', '12:00', '18:00', 6, 120.00, 'completed', 'paid', 'Perfect spot', 'Very professional'),
(uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '1 day', '17:00', '22:00', 5, 110.00, 'completed', 'paid', 'Busy evening!', 'Great turnout'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE + INTERVAL '2 days', '11:00', '16:00', 5, 125.00, 'confirmed', 'paid', 'Looking forward to it!', 'Confirmed'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '5 days', '12:00', '18:00', 6, 168.00, 'confirmed', 'paid', 'Excited for the waterfront!', 'Confirmed'),
(uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', '660e8400-e29b-41d4-a716-446655440003', CURRENT_DATE + INTERVAL '7 days', '10:00', '16:00', 6, 180.00, 'pending', 'pending', 'Royal Mile here we come!', 'Pending review')
ON CONFLICT (id) DO NOTHING; 
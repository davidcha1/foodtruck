-- Add UK Venues to FoodTruck Hub Database (Direct Version)
-- This script adds venues by temporarily dropping and recreating foreign key constraints

-- First, let's create a real user in auth.users and public.users
-- We'll use a simple approach by creating the user directly

-- Create a user in auth.users first
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'venue.owner1@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create the same user in public.users
INSERT INTO public.users (
  id, email, role, first_name, last_name, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'venue.owner1@example.com',
  'venue_owner',
  'Sarah',
  'Mitchell',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create venue owner profile
INSERT INTO public.venue_owner_profiles (
  user_id, business_name, business_type, verification_status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'London Markets Ltd',
  'retail',
  'verified'
) ON CONFLICT (user_id) DO NOTHING;

-- Now add the venues with the real user ID
INSERT INTO public.listings (
  id, owner_id, title, description, address, city, state, postal_code, country,
  latitude, longitude, hourly_rate, daily_rate, weekly_rate, min_booking_hours, max_booking_hours,
  status, created_at, updated_at
) VALUES 
  -- 1. London - Camden Market
  (
    '11111111-1111-1111-1111-111111111111',
    '550e8400-e29b-41d4-a716-446655440001',
    'Camden Market Food Court',
    'Prime location in the heart of Camden Market. High foot traffic area perfect for food trucks. Access to electricity and water available.',
    'Camden Lock Place',
    'London',
    'Greater London',
    'NW1 8AF',
    'UK',
    51.5417, -0.1446,
    25.00, 200.00, 1200.00,
    4, 12,
    'active',
    NOW(), NOW()
  ),

  -- 2. Manchester - Northern Quarter
  (
    '22222222-2222-2222-2222-222222222222',
    '550e8400-e29b-41d4-a716-446655440001',
    'Northern Quarter Street Food Hub',
    'Trendy area in Manchester''s Northern Quarter. Popular with young professionals and students. Covered area available.',
    'Stevenson Square',
    'Manchester',
    'Greater Manchester',
    'M1 1FR',
    'UK',
    53.4831, -2.2344,
    20.00, 160.00, 1000.00,
    3, 10,
    'active',
    NOW(), NOW()
  ),

  -- 3. Birmingham - Bullring
  (
    '33333333-3333-3333-3333-333333333333',
    '550e8400-e29b-41d4-a716-446655440001',
    'Bullring Shopping Centre Plaza',
    'High-traffic location next to Birmingham''s main shopping centre. Perfect for lunch crowds and weekend shoppers.',
    'Bullring Shopping Centre',
    'Birmingham',
    'West Midlands',
    'B5 4BU',
    'UK',
    52.4775, -1.8936,
    22.00, 180.00, 1100.00,
    4, 12,
    'active',
    NOW(), NOW()
  ),

  -- 4. Liverpool - Albert Dock
  (
    '44444444-4444-4444-4444-444444444444',
    '550e8400-e29b-41d4-a716-446655440001',
    'Albert Dock Waterfront',
    'Historic waterfront location with stunning views. Popular tourist destination with high foot traffic.',
    'Albert Dock',
    'Liverpool',
    'Merseyside',
    'L3 4AA',
    'UK',
    53.4008, -2.9944,
    28.00, 220.00, 1400.00,
    4, 12,
    'active',
    NOW(), NOW()
  ),

  -- 5. Edinburgh - Royal Mile
  (
    '55555555-5555-5555-5555-555555555555',
    '550e8400-e29b-41d4-a716-446655440001',
    'Royal Mile Street Food Market',
    'Historic location on Edinburgh''s famous Royal Mile. High tourist traffic and local footfall.',
    'Royal Mile',
    'Edinburgh',
    'Scotland',
    'EH1 1RE',
    'UK',
    55.9497, -3.1908,
    30.00, 240.00, 1500.00,
    4, 12,
    'active',
    NOW(), NOW()
  ),

  -- 6. Bristol - Harbourside
  (
    '66666666-6666-6666-6666-666666666666',
    '550e8400-e29b-41d4-a716-446655440001',
    'Bristol Harbourside Market',
    'Beautiful harbourside location with marina views. Popular weekend destination for families and foodies.',
    'Harbourside',
    'Bristol',
    'Bristol',
    'BS1 5UH',
    'UK',
    51.4505, -2.5975,
    24.00, 190.00, 1200.00,
    3, 10,
    'active',
    NOW(), NOW()
  ),

  -- 7. Leeds - Trinity Kitchen
  (
    '77777777-7777-7777-7777-777777777777',
    '550e8400-e29b-41d4-a716-446655440001',
    'Trinity Kitchen Food Court',
    'Modern food court in Leeds'' premier shopping centre. High foot traffic and covered location.',
    'Trinity Leeds',
    'Leeds',
    'West Yorkshire',
    'LS1 5AY',
    'UK',
    53.7965, -1.5479,
    26.00, 200.00, 1300.00,
    4, 12,
    'active',
    NOW(), NOW()
  ),

  -- 8. Glasgow - Buchanan Street
  (
    '88888888-8888-8888-8888-888888888888',
    '550e8400-e29b-41d4-a716-446655440001',
    'Buchanan Street Pedestrian Zone',
    'Main shopping street in Glasgow with high foot traffic. Perfect for lunch and weekend crowds.',
    'Buchanan Street',
    'Glasgow',
    'Scotland',
    'G1 2LL',
    'UK',
    55.8609, -4.2514,
    25.00, 200.00, 1250.00,
    4, 12,
    'active',
    NOW(), NOW()
  ),

  -- 9. Cardiff - Cardiff Bay
  (
    '99999999-9999-9999-9999-999999999999',
    '550e8400-e29b-41d4-a716-446655440001',
    'Cardiff Bay Waterfront',
    'Scenic waterfront location with marina views. Popular with tourists and locals alike.',
    'Cardiff Bay',
    'Cardiff',
    'Wales',
    'CF10 5BZ',
    'UK',
    51.4647, -3.1631,
    23.00, 180.00, 1150.00,
    3, 10,
    'active',
    NOW(), NOW()
  ),

  -- 10. Newcastle - Quayside
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '550e8400-e29b-41d4-a716-446655440001',
    'Newcastle Quayside Market',
    'Historic quayside location with views of the Tyne Bridge. Popular weekend destination.',
    'Quayside',
    'Newcastle',
    'Tyne and Wear',
    'NE1 3RE',
    'UK',
    54.9783, -1.6178,
    21.00, 170.00, 1100.00,
    3, 10,
    'active',
    NOW(), NOW()
  );

-- Add amenities for each venue
INSERT INTO public.amenities (
  listing_id, running_water, electricity_type, gas_supply, shelter, toilet_facilities,
  wifi, customer_seating, waste_disposal, overnight_parking, security_cctv
) VALUES 
  -- Camden Market
  ('11111111-1111-1111-1111-111111111111', true, '240v', true, true, true, true, true, true, false, true),
  
  -- Northern Quarter
  ('22222222-2222-2222-2222-222222222222', true, '240v', false, true, false, true, false, true, false, true),
  
  -- Bullring
  ('33333333-3333-3333-3333-333333333333', true, '240v', true, true, true, true, true, true, false, true),
  
  -- Albert Dock
  ('44444444-4444-4444-4444-444444444444', true, '240v', false, true, true, true, true, true, false, true),
  
  -- Royal Mile
  ('55555555-5555-5555-5555-555555555555', false, 'none', false, false, false, false, false, true, false, false),
  
  -- Bristol Harbourside
  ('66666666-6666-6666-6666-666666666666', true, '240v', false, true, true, true, true, true, false, true),
  
  -- Trinity Kitchen
  ('77777777-7777-7777-7777-777777777777', true, '240v', true, true, true, true, true, true, false, true),
  
  -- Buchanan Street
  ('88888888-8888-8888-8888-888888888888', false, 'none', false, false, false, false, false, true, false, false),
  
  -- Cardiff Bay
  ('99999999-9999-9999-9999-999999999999', true, '240v', false, true, true, true, true, true, false, true),
  
  -- Newcastle Quayside
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, '240v', false, true, true, true, true, true, false, true);

-- Update location columns using the trigger
UPDATE public.listings SET 
  location = ST_MakePoint(longitude, latitude)
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
); 
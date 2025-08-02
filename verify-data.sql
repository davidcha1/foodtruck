-- Verification Script for FoodTruck Hub Data Migration
-- Run this in your Supabase dashboard SQL editor to verify all data

-- Check all table counts
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Venue Owners' as table_name, COUNT(*) as count FROM public.venue_owner_profiles
UNION ALL
SELECT 'Vendors' as table_name, COUNT(*) as count FROM public.vendor_profiles
UNION ALL
SELECT 'Listings' as table_name, COUNT(*) as count FROM public.listings
UNION ALL
SELECT 'Amenities' as table_name, COUNT(*) as count FROM public.amenities
UNION ALL
SELECT 'Bookings' as table_name, COUNT(*) as count FROM public.bookings;

-- Check sample listings
SELECT id, title, city, hourly_rate, daily_rate FROM public.listings LIMIT 5;

-- Check sample bookings
SELECT 
  b.id,
  l.title as venue_name,
  u.first_name || ' ' || u.last_name as vendor_name,
  b.booking_date,
  b.start_time,
  b.end_time,
  b.total_cost,
  b.status
FROM public.bookings b
JOIN public.listings l ON b.listing_id = l.id
JOIN public.users u ON b.vendor_id = u.id
LIMIT 5;

-- Check venue owners
SELECT 
  u.first_name || ' ' || u.last_name as owner_name,
  vop.business_name,
  vop.business_type,
  vop.verification_status
FROM public.venue_owner_profiles vop
JOIN public.users u ON vop.user_id = u.id;

-- Check vendors
SELECT 
  u.first_name || ' ' || u.last_name as vendor_name,
  vp.food_truck_name,
  vp.cuisine_type,
  vp.verification_status
FROM public.vendor_profiles vp
JOIN public.users u ON vp.user_id = u.id; 
-- Minimal seed data that works with the current database setup
-- This seed file only creates the necessary schema and doesn't insert data with foreign key dependencies

-- Note: This seed file doesn't create any listings or users
-- Users will be created through the normal signup process
-- Listings will be created through the application

-- Update location geography column for spatial queries (if any listings exist)
UPDATE public.listings 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE location IS NULL; 
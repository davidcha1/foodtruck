-- Add missing max_trucks column to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS max_trucks INTEGER DEFAULT 1;

-- Add missing space_size_sqm column if it doesn't exist
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS space_size_sqm INTEGER;

-- Update existing listings to have max_trucks = 1 if NULL
UPDATE public.listings 
SET max_trucks = 1 
WHERE max_trucks IS NULL;

-- Add missing amenities columns that might be referenced in the code
ALTER TABLE public.amenities 
ADD COLUMN IF NOT EXISTS loading_dock BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.amenities 
ADD COLUMN IF NOT EXISTS refrigeration_access BOOLEAN NOT NULL DEFAULT FALSE; 
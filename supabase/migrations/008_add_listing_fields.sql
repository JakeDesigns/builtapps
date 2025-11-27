-- Add new listing fields to properties table
-- Migration: 008_add_listing_fields.sql

-- Add lotNumber (can be string or number, using text for flexibility)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS lot_number text;

-- Add lotWidth (number)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS lot_width numeric(10, 2);

-- Add lotDepth (number)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS lot_depth numeric(10, 2);

-- Note: block already exists as text, keeping it as is

-- Add lotPrice (number)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS lot_price numeric(12, 2);

-- Add housePrice (number)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS house_price numeric(12, 2);

-- Note: squareFootage - we have size_sqft, but adding square_footage as well for clarity
-- If you want to use size_sqft instead, we can map it in the application layer
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS square_footage integer;

-- Add acres (number, will be calculated in UI but stored for reference)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS acres numeric(10, 4);

-- Update garageSize - currently integer, but making it more flexible
-- Keeping garage_size as integer but adding garage_size_text for string values
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS garage_size_text text;

-- Add lotInfo (array of strings for bullet points)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS lot_info text[];

-- Add isDeleted (boolean for soft delete)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS properties_is_deleted_idx ON public.properties(is_deleted);

-- Update RLS policies to exclude deleted properties by default
-- Note: This doesn't change existing policies, but queries should filter is_deleted = false


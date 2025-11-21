-- Direct migration to add all missing columns to properties table
-- Run this in Supabase SQL Editor

-- Add lot column
ALTER TABLE public.properties 
ADD COLUMN lot text;

-- Add block column
ALTER TABLE public.properties 
ADD COLUMN block text;

-- Add depth column
ALTER TABLE public.properties 
ADD COLUMN depth text;

-- Add width column
ALTER TABLE public.properties 
ADD COLUMN width text;

-- Add building_setbacks column
ALTER TABLE public.properties 
ADD COLUMN building_setbacks text;

-- Add power_box_location column
ALTER TABLE public.properties 
ADD COLUMN power_box_location text;

-- Add 'competitors' to the property_category enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'competitors' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'property_category'
        )
    ) THEN
        ALTER TYPE property_category ADD VALUE 'competitors';
    END IF;
END $$;


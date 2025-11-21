-- Comprehensive migration to add all missing property fields
-- Run each statement individually if you get errors about columns already existing

-- Add lot column
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS lot text;

-- Add block column
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS block text;

-- Add depth column
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS depth text;

-- Add width column
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS width text;

-- Add building_setbacks column
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS building_setbacks text;

-- Add power_box_location column
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS power_box_location text;

-- Add 'competitors' to the property_category enum
-- Note: This will fail if 'competitors' already exists, which is fine
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
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


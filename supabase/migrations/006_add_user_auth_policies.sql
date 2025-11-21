-- Add user_id column to properties table
-- This links properties to the user who created them
ALTER TABLE public.properties 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX properties_user_id_idx ON public.properties(user_id);

-- Drop the old "public read" policy
DROP POLICY IF EXISTS "public read" ON public.properties;

-- Create new RLS policies for authenticated users

-- Policy: Users can view all properties (public read like Zillow)
CREATE POLICY "Anyone can view properties"
ON public.properties
FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert properties
CREATE POLICY "Authenticated users can insert properties"
ON public.properties
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own properties
CREATE POLICY "Users can update own properties"
ON public.properties
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own properties
CREATE POLICY "Users can delete own properties"
ON public.properties
FOR DELETE
USING (auth.uid() = user_id);

-- Note: This allows all users to VIEW all properties (like Zillow)
-- but only property owners can edit/delete their own properties


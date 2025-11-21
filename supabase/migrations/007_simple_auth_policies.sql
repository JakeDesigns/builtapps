-- ALTERNATIVE: Simple approach - just require authentication for writes
-- This keeps properties visible to everyone but requires login to add/edit

-- Drop the old "public read" policy if it exists
DROP POLICY IF EXISTS "public read" ON public.properties;

-- Anyone can view properties (no login required for viewing)
CREATE POLICY "Anyone can view properties"
ON public.properties
FOR SELECT
USING (true);

-- Only authenticated users can insert properties
CREATE POLICY "Authenticated users can insert"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update properties
CREATE POLICY "Authenticated users can update"
ON public.properties
FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete properties
CREATE POLICY "Authenticated users can delete"
ON public.properties
FOR DELETE
TO authenticated
USING (true);

-- Note: This allows VIEWING without login (like your current setup)
-- but requires login to add/edit/delete properties
-- Does NOT track which user created which property


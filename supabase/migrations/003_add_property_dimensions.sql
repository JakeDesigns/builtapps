-- Add new property dimension and location fields
alter table public.properties
add column depth text,
add column width text,
add column building_setbacks text,
add column power_box_location text;


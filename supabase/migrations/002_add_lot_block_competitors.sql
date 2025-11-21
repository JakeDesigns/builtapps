-- Add lot and block columns to properties table
alter table public.properties
add column lot text,
add column block text;

-- Add 'competitors' to the property_category enum
alter type property_category add value 'competitors';


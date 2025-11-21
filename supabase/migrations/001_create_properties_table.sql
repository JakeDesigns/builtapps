-- Create enum type for property categories
create type property_category as enum (
  'vacant_lot',
  'planned_construction',
  'under_construction',
  'for_sale_completed',
  'pending',
  'pending_under_construction',
  'sold'
);

-- Create properties table
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subdivision_phase text,
  address text,
  house_name text,
  size_sqft integer,
  garage_size integer,
  bedrooms integer,
  baths numeric(3,1),
  lat double precision not null,
  lng double precision not null,
  category property_category not null,
  created_at timestamptz not null default now()
);

-- Create indexes for better query performance
create index properties_category_idx on public.properties(category);
create index properties_lat_lng_idx on public.properties(lat, lng);

-- Enable Row Level Security
alter table public.properties enable row level security;

-- Create policy to allow public reads
create policy "public read" on public.properties for select using (true);

-- Note: Writes occur via Next.js API route using service role key and admin token


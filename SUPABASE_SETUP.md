# Supabase Database Setup

Follow these steps to set up your Supabase database:

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: Choose a name (e.g., "property-listings")
   - Database Password: Create a strong password (save this!)
   - Region: Choose the closest region
5. Click "Create new project"
6. Wait for the project to be set up (this takes a few minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Run the Database Migration

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/001_create_properties_table.sql`
4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 4: Verify the Table Was Created

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `properties` table
3. Click on it to see the columns:
   - id (uuid)
   - title (text)
   - subdivision_phase (text)
   - address (text)
   - house_name (text)
   - size_sqft (integer)
   - garage_size (integer)
   - bedrooms (integer)
   - baths (numeric)
   - lat (double precision)
   - lng (double precision)
   - category (property_category enum)
   - created_at (timestamptz)

## Step 5: Update Your .env.local File

Replace the placeholder values in `.env.local` with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

- **Can't see the SQL Editor?** Make sure you're logged in and your project is fully initialized
- **Migration fails?** Check that you copied the entire SQL file content
- **Table not showing?** Refresh the Table Editor page


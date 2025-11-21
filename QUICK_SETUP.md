# Quick Setup Guide

Based on your Supabase project, here's what you need to do:

## Step 1: Get Your Supabase API Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (the one with reference: glwblnjxxiiqnpqdlhby)
3. Go to **Settings** → **API**
4. Copy these three values:

   - **Project URL**: `https://glwblnjxxiiqnpqdlhby.supabase.co`
   - **anon public** key: (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key: (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`) - **Keep this secret!**

## Step 2: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_create_properties_table.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see: "Success. No rows returned"

## Step 3: Create/Update .env.local File

Create a file named `.env.local` in your project root with:

```env
# Mapbox Configuration (get from https://account.mapbox.com/access-tokens/)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://glwblnjxxiiqnpqdlhby.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here

# Admin Token (create a random secure string)
ADMIN_TOKEN=your_random_secure_token_here
```

## Step 4: Get Mapbox Token

1. Go to https://account.mapbox.com/access-tokens/
2. Sign up or log in
3. Copy your default public token (or create a new one)
4. Add it to `.env.local` as `NEXT_PUBLIC_MAPBOX_TOKEN`

## Step 5: Restart Dev Server

After updating `.env.local`, restart your dev server:
- Stop the current server (Ctrl+C)
- Run: `npm run dev`

## Your Project Reference

From your connection string, your Supabase project details:
- **Project Reference**: glwblnjxxiiqnpqdlhby
- **API URL**: https://glwblnjxxiiqnpqdlhby.supabase.co
- **Database Host**: db.glwblnjxxiiqnpqdlhby.supabase.co


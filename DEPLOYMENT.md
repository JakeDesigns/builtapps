# Deployment Guide

## Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Mapbox Account**: Get an access token from [mapbox.com](https://www.mapbox.com)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Step 1: Set Up Supabase

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the migration script from `supabase/migrations/001_create_properties_table.sql`
4. Go to Settings > API to get your:
   - Project URL
   - Anon/Public key
   - Service Role key (keep this secret!)

## Step 2: Set Up Mapbox

1. Sign up/login at [mapbox.com](https://www.mapbox.com)
2. Go to Account > Access Tokens
3. Create a new token or use the default public token
4. Copy the token

## Step 3: Deploy to Vercel

### Option A: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Set environment variables via Vercel dashboard or CLI

## Environment Variables

Set these in your Vercel project settings (Settings > Environment Variables):

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_TOKEN=your_secret_admin_token
```

## Step 4: Configure Custom Domain (builtapps.io)

1. In your Vercel project dashboard, go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain:
   - For root domain: `builtapps.io`
   - For subdomain: `app.builtapps.io` or `your-app.builtapps.io`
4. Vercel will automatically:
   - Configure DNS records (if domain is managed by Vercel)
   - Set up SSL certificate (automatic HTTPS)
   - Provide DNS configuration if domain is managed elsewhere
5. If your domain is managed outside Vercel:
   - Copy the DNS records provided by Vercel
   - Add them to your domain registrar's DNS settings
   - Wait for DNS propagation (usually 5-30 minutes)

## Step 5: Configure Mapbox Token Restrictions (Recommended)

1. Go to Mapbox Account > Access Tokens
2. Click on your token
3. Under "URL restrictions", add your domain:
   - `https://builtapps.io` (or your subdomain)
   - `https://*.vercel.app` (for preview deployments)
4. This prevents token abuse

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Try adding a property
3. Test search functionality
4. Verify filters work
5. Test compare mode

## Troubleshooting

### Map not loading
- Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
- Verify Mapbox token restrictions allow your domain
- Check browser console for errors

### Properties not loading
- Verify Supabase environment variables are correct
- Check Supabase RLS policies are set up correctly
- Check browser network tab for API errors

### Can't add properties
- Check that Supabase service role key is set
- Verify the properties table exists and has correct schema
- Check Vercel function logs for errors

## Post-Deployment

1. **Verify Domain**: Test that `builtapps.io` (or your subdomain) loads correctly
2. **Update Mapbox Restrictions**: Ensure your Mapbox token allows your custom domain
3. **Enable Authentication** (Recommended): Add Supabase Auth or another auth solution
4. **Re-enable Admin Token**: Uncomment the admin token check in `app/api/properties/route.ts`
5. **Set up Monitoring**: Add error tracking (e.g., Sentry)
6. **Test All Features**: Verify map, properties, search, and filters work on production domain

## Quick Checklist for builtapps.io Deployment

- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Repository imported in Vercel
- [ ] All environment variables added in Vercel:
  - [ ] `NEXT_PUBLIC_MAPBOX_TOKEN`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Domain `builtapps.io` added in Vercel project settings
- [ ] DNS records configured (if needed)
- [ ] Mapbox token restrictions updated to include `builtapps.io`
- [ ] Application deployed and accessible at `builtapps.io`
- [ ] All features tested on production domain


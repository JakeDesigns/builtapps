# Zillow-like Property Listings App

A Next.js application for managing and viewing property listings on an interactive map, similar to Zillow.

## Features

- **Interactive Map**: View properties on a Mapbox-powered map with color-coded markers by category
- **Property Categories**:
  - Vacant lots (brown)
  - Planned for construction (light blue)
  - Homes under construction (blue)
  - Homes for sale and completed (green)
  - Homes pending (red)
  - Homes pending & under construction (half red/blue)
  - Homes sold (gold)
- **Search**: US-only address autocomplete search
- **Filtering**: Toggle visibility of property categories
- **Compare Mode**: Select multiple properties to compare side-by-side
- **Add Properties**: Form to manually add new property listings

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Mapbox GL JS** for mapping
- **Supabase** for database
- **Vercel** for deployment

## Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Mapbox account and access token

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiamFrZWxlc2xpZTIiLCJhIjoiY21odTFsOTdkMHV1NzJsb2owdTB2aTk0MSJ9.dLuZbV87_nomHH8GKGJUow

NEXT_PUBLIC_SUPABASE_URL=https://glwblnjxxiiqnpqdlhby.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdsd2Jsbmp4eGlpcW5wcWRsaGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MjI5MzUsImV4cCI6MjA3ODM5ODkzNX0.ec-vOy5VrDL0DBPhDRXVls7nVqq7jfZTMnWL-Q8jkGs

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdsd2Jsbmp4eGlpcW5wcWRsaGJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjgyMjkzNSwiZXhwIjoyMDc4Mzk4OTM1fQ.vnaCqdLmCXIZBFSypI5x1LhpgDuQjVXs7kMK2XAP1qk

ADMIN_TOKEN=dev-admin-token-12345
```

3. Set up Supabase database:

Run the SQL migration in your Supabase SQL Editor:

```sql
-- See supabase/migrations/001_create_properties_table.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox access token
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)
- `ADMIN_TOKEN`: Secret token for protecting write operations (currently not enforced - add authentication in production)

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

The app will be automatically deployed on every push to your main branch.

## Security Note

Currently, the API allows writes without authentication. In production, you should:
1. Implement proper authentication (e.g., Supabase Auth)
2. Re-enable the admin token check in `app/api/properties/route.ts`
3. Use server actions or API routes with proper session validation

## Usage

1. **View Properties**: Properties are displayed as colored markers on the map
2. **Search**: Use the search bar to find addresses (US only)
3. **Filter**: Click the "Filters" button to toggle category visibility
4. **View Details**: Click a marker to see property details
5. **Compare**: Toggle "Compare" mode and click multiple properties to compare them
6. **Add Property**: Click "Add Property" to create a new listing

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── geocode/          # Mapbox geocoding proxy
│   │   └── properties/        # Property CRUD API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main map page
├── components/
│   ├── controls/              # Search bar, filters
│   ├── map/                   # Map components
│   ├── property/              # Property cards, forms
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── supabase/              # Supabase clients
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Utility functions
└── supabase/
    └── migrations/             # Database migrations
```

## License

MIT


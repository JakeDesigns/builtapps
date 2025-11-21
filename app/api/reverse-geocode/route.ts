import { NextRequest, NextResponse } from 'next/server';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude parameters are required' }, { status: 400 });
  }

  if (!MAPBOX_TOKEN) {
    return NextResponse.json({ error: 'Mapbox token not configured' }, { status: 500 });
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=US&types=address,place,poi`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      // Get the most relevant result (usually the first one)
      const feature = data.features[0];
      return NextResponse.json({
        address: feature.place_name,
        center: feature.center,
      }, {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
      });
    }

    return NextResponse.json({ address: null });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json({ error: 'Reverse geocoding failed' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase/server';
import { PropertyFormData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Database configuration error',
        details: 'Missing Supabase environment variables. Please check your .env.local file.',
        hint: 'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
      }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to fetch properties';
      let details = error.message || JSON.stringify(error);
      let hint = '';
      
      // Check for common Supabase errors
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        errorMessage = 'Database table not found';
        hint = 'Make sure you\'ve run the SQL migration in Supabase. Check the supabase/migrations folder.';
      } else if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        errorMessage = 'Database permission error';
        hint = 'Check Row Level Security (RLS) policies in Supabase. Ensure the "public read" policy exists.';
      } else if (error.message?.includes('connection') || error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Database connection error';
        hint = 'Check your Supabase project status and network connection.';
      } else if (error.code) {
        errorMessage = `Database error (${error.code})`;
        hint = `Check the Supabase dashboard for more details. Error code: ${error.code}`;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: details,
        hint: hint,
        code: error.code || undefined
      }, { status: 500 });
    }

    return NextResponse.json({ properties: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // In production, you should implement proper authentication
    // For now, we'll allow writes (you can add admin token check later)
    // const adminToken = request.headers.get('x-admin-token');
    // const expectedToken = process.env.ADMIN_TOKEN;
    // if (!expectedToken || adminToken !== expectedToken) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body: PropertyFormData = await request.json();

    // Validate required fields
    if (!body.title || body.lat === undefined || body.lng === undefined || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, lat, lng, category' },
        { status: 400 }
      );
    }

    // Validate and sanitize input
    const title = String(body.title || '').trim();
    if (!title || title.length > 500) {
      return NextResponse.json(
        { error: 'Title is required and must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Validate coordinates are within valid ranges
    if (typeof body.lat !== 'number' || typeof body.lng !== 'number' ||
        isNaN(body.lat) || isNaN(body.lng) ||
        body.lat < -90 || body.lat > 90 ||
        body.lng < -180 || body.lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' },
        { status: 400 }
      );
    }

    // Validate numeric fields if provided
    if (body.size_sqft !== undefined && body.size_sqft !== null && (typeof body.size_sqft !== 'number' || body.size_sqft < 0)) {
      return NextResponse.json(
        { error: 'Size (sqft) must be a positive number' },
        { status: 400 }
      );
    }
    if (body.garage_size !== undefined && body.garage_size !== null && (typeof body.garage_size !== 'number' || body.garage_size < 0)) {
      return NextResponse.json(
        { error: 'Garage size must be a positive number' },
        { status: 400 }
      );
    }
    if (body.bedrooms !== undefined && body.bedrooms !== null && (typeof body.bedrooms !== 'number' || body.bedrooms < 0 || !Number.isInteger(body.bedrooms))) {
      return NextResponse.json(
        { error: 'Bedrooms must be a non-negative integer' },
        { status: 400 }
      );
    }
    if (body.baths !== undefined && body.baths !== null && (typeof body.baths !== 'number' || body.baths < 0)) {
      return NextResponse.json(
        { error: 'Baths must be a positive number' },
        { status: 400 }
      );
    }

    // Validate new listing fields
    if (body.lot_width !== undefined && body.lot_width !== null && (typeof body.lot_width !== 'number' || body.lot_width < 0)) {
      return NextResponse.json(
        { error: 'Lot width must be a positive number' },
        { status: 400 }
      );
    }
    if (body.lot_depth !== undefined && body.lot_depth !== null && (typeof body.lot_depth !== 'number' || body.lot_depth < 0)) {
      return NextResponse.json(
        { error: 'Lot depth must be a positive number' },
        { status: 400 }
      );
    }
    if (body.lot_price !== undefined && body.lot_price !== null && (typeof body.lot_price !== 'number' || body.lot_price < 0)) {
      return NextResponse.json(
        { error: 'Lot price must be a positive number' },
        { status: 400 }
      );
    }
    if (body.house_price !== undefined && body.house_price !== null && (typeof body.house_price !== 'number' || body.house_price < 0)) {
      return NextResponse.json(
        { error: 'House price must be a positive number' },
        { status: 400 }
      );
    }
    if (body.square_footage !== undefined && body.square_footage !== null && (typeof body.square_footage !== 'number' || body.square_footage < 0 || !Number.isInteger(body.square_footage))) {
      return NextResponse.json(
        { error: 'Square footage must be a non-negative integer' },
        { status: 400 }
      );
    }
    if (body.acres !== undefined && body.acres !== null && (typeof body.acres !== 'number' || body.acres < 0)) {
      return NextResponse.json(
        { error: 'Acres must be a positive number' },
        { status: 400 }
      );
    }
    if (body.lot_info !== undefined && body.lot_info !== null && !Array.isArray(body.lot_info)) {
      return NextResponse.json(
        { error: 'Lot info must be an array of strings' },
        { status: 400 }
      );
    }

    // Convert lot_number to string if it's a number
    const lotNumber = body.lot_number !== undefined && body.lot_number !== null 
      ? String(body.lot_number) 
      : null;
    
    // Convert garage_size_text to string if provided
    const garageSizeText = body.garage_size_text !== undefined && body.garage_size_text !== null
      ? String(body.garage_size_text)
      : null;

    // Validate and sanitize lot_info array
    const lotInfo = body.lot_info !== undefined && body.lot_info !== null
      ? body.lot_info.filter(item => typeof item === 'string' && item.trim().length > 0).map(item => item.trim())
      : null;

    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert({
        title: title,
        subdivision_phase: body.subdivision_phase || null,
        lot: body.lot || null,
        block: body.block || null,
        address: body.address || null,
        house_name: body.house_name || null,
        size_sqft: body.size_sqft || null,
        garage_size: body.garage_size || null,
        bedrooms: body.bedrooms || null,
        baths: body.baths || null,
        depth: body.depth || null,
        width: body.width || null,
        building_setbacks: body.building_setbacks || null,
        power_box_location: body.power_box_location || null,
        lat: body.lat,
        lng: body.lng,
        category: body.category,
        // New listing fields
        lot_number: lotNumber,
        lot_width: body.lot_width || null,
        lot_depth: body.lot_depth || null,
        lot_price: body.lot_price || null,
        house_price: body.house_price || null,
        square_footage: body.square_footage || null,
        acres: body.acres || null,
        garage_size_text: garageSizeText,
        lot_info: lotInfo,
        is_deleted: body.is_deleted || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      const errorMessage = error.message || JSON.stringify(error);
      return NextResponse.json({ 
        error: 'Failed to create property',
        details: errorMessage,
        hint: errorMessage.includes('column') || errorMessage.includes('does not exist')
          ? 'Make sure you\'ve run the SQL migration: supabase/migrations/003_add_property_dimensions.sql'
          : undefined,
        code: error.code || ''
      }, { status: 500 });
    }

    return NextResponse.json({ property: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


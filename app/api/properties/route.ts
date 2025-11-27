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

    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert({
        title: body.title,
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
        square_footage: body.square_footage || null,
        acres: body.acres || null,
        lot_number: body.lot_number 
          ? (typeof body.lot_number === 'number' ? String(body.lot_number) : body.lot_number)
          : null,
        lot_width: body.lot_width || null,
        lot_depth: body.lot_depth || null,
        lot_price: body.lot_price || null,
        house_price: body.house_price || null,
        garage_size_text: body.garage_size_text 
          ? (typeof body.garage_size_text === 'number' ? String(body.garage_size_text) : body.garage_size_text)
          : null,
        lot_info: body.lot_info && body.lot_info.length > 0 
          ? body.lot_info.filter((item: string) => item.trim().length > 0)
          : null,
        is_deleted: false,
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


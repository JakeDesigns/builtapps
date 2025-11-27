import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Category, UpdatePropertyData } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
    
    // Validate property ID format (UUID)
    if (!propertyId || typeof propertyId !== 'string' || propertyId.length < 10) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate category if provided
    if (body.category) {
      const validCategories: Category[] = [
        'vacant_lot',
        'planned_construction',
        'under_construction',
        'for_sale_completed',
        'pending',
        'pending_under_construction',
        'sold',
        'competitors',
      ];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    // Only include lot/block if they have values (to avoid errors if columns don't exist yet)
    const updateData: UpdatePropertyData = {};
    if (body.category !== undefined) updateData.category = body.category;
    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (title.length > 500) {
        return NextResponse.json(
          { error: 'Title must be less than 500 characters' },
          { status: 400 }
        );
      }
      updateData.title = title;
    }
    if (body.subdivision_phase !== undefined) updateData.subdivision_phase = body.subdivision_phase;
    // Only include lot/block if they're not null/undefined (they're optional fields)
    if (body.lot !== undefined && body.lot !== null) updateData.lot = body.lot;
    if (body.block !== undefined && body.block !== null) updateData.block = body.block;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.house_name !== undefined) updateData.house_name = body.house_name;
    if (body.size_sqft !== undefined) updateData.size_sqft = body.size_sqft;
    if (body.garage_size !== undefined) updateData.garage_size = body.garage_size;
    if (body.bedrooms !== undefined) updateData.bedrooms = body.bedrooms;
    if (body.baths !== undefined) updateData.baths = body.baths;
    if (body.depth !== undefined) updateData.depth = body.depth;
    if (body.width !== undefined) updateData.width = body.width;
    if (body.building_setbacks !== undefined) updateData.building_setbacks = body.building_setbacks;
    if (body.power_box_location !== undefined) updateData.power_box_location = body.power_box_location;
    if (body.lat !== undefined) {
      if (typeof body.lat !== 'number' || isNaN(body.lat) || body.lat < -90 || body.lat > 90) {
        return NextResponse.json(
          { error: 'Invalid latitude. Must be between -90 and 90' },
          { status: 400 }
        );
      }
      updateData.lat = body.lat;
    }
    if (body.lng !== undefined) {
      if (typeof body.lng !== 'number' || isNaN(body.lng) || body.lng < -180 || body.lng > 180) {
        return NextResponse.json(
          { error: 'Invalid longitude. Must be between -180 and 180' },
          { status: 400 }
        );
      }
      updateData.lng = body.lng;
    }

    // Handle new listing fields
    if (body.lot_number !== undefined) {
      updateData.lot_number = body.lot_number !== null ? String(body.lot_number) : null;
    }
    if (body.lot_width !== undefined) {
      if (body.lot_width !== null && (typeof body.lot_width !== 'number' || body.lot_width < 0)) {
        return NextResponse.json(
          { error: 'Lot width must be a positive number' },
          { status: 400 }
        );
      }
      updateData.lot_width = body.lot_width;
    }
    if (body.lot_depth !== undefined) {
      if (body.lot_depth !== null && (typeof body.lot_depth !== 'number' || body.lot_depth < 0)) {
        return NextResponse.json(
          { error: 'Lot depth must be a positive number' },
          { status: 400 }
        );
      }
      updateData.lot_depth = body.lot_depth;
    }
    if (body.lot_price !== undefined) {
      if (body.lot_price !== null && (typeof body.lot_price !== 'number' || body.lot_price < 0)) {
        return NextResponse.json(
          { error: 'Lot price must be a positive number' },
          { status: 400 }
        );
      }
      updateData.lot_price = body.lot_price;
    }
    if (body.house_price !== undefined) {
      if (body.house_price !== null && (typeof body.house_price !== 'number' || body.house_price < 0)) {
        return NextResponse.json(
          { error: 'House price must be a positive number' },
          { status: 400 }
        );
      }
      updateData.house_price = body.house_price;
    }
    if (body.square_footage !== undefined) {
      if (body.square_footage !== null && (typeof body.square_footage !== 'number' || body.square_footage < 0 || !Number.isInteger(body.square_footage))) {
        return NextResponse.json(
          { error: 'Square footage must be a non-negative integer' },
          { status: 400 }
        );
      }
      updateData.square_footage = body.square_footage;
    }
    if (body.acres !== undefined) {
      if (body.acres !== null && (typeof body.acres !== 'number' || body.acres < 0)) {
        return NextResponse.json(
          { error: 'Acres must be a positive number' },
          { status: 400 }
        );
      }
      updateData.acres = body.acres;
    }
    if (body.garage_size_text !== undefined) {
      updateData.garage_size_text = body.garage_size_text !== null ? String(body.garage_size_text) : null;
    }
    if (body.lot_info !== undefined) {
      if (body.lot_info !== null && !Array.isArray(body.lot_info)) {
        return NextResponse.json(
          { error: 'Lot info must be an array of strings' },
          { status: 400 }
        );
      }
      // Sanitize lot_info array
      updateData.lot_info = body.lot_info !== null
        ? body.lot_info.filter((item: unknown) => typeof item === 'string' && item.trim().length > 0).map((item: string) => item.trim())
        : null;
    }
    if (body.is_deleted !== undefined) {
      updateData.is_deleted = body.is_deleted;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Try to update - if lot/block columns don't exist, remove them and retry
    let { data, error } = await supabaseAdmin
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single();

    // If error is about missing lot/block columns, retry without them
    if (error) {
      const errorMessage = error.message || JSON.stringify(error);
      const errorCode = error.code || '';
      
      // Check if it's a column doesn't exist error for lot/block
      if ((errorMessage.includes('column') || errorCode === '42703') && 
          (errorMessage.includes('lot') || errorMessage.includes('block'))) {
        console.warn('lot/block columns not found, retrying without them');
        
        // Remove lot/block from update and retry
        const retryUpdateData = { ...updateData };
        delete retryUpdateData.lot;
        delete retryUpdateData.block;
        
        const retryResult = await supabaseAdmin
          .from('properties')
          .update(retryUpdateData)
          .eq('id', propertyId)
          .select()
          .single();
        
        if (retryResult.error) {
          console.error('Error updating property (retry):', retryResult.error);
          return NextResponse.json({ 
            error: 'Failed to update property',
            details: retryResult.error.message || JSON.stringify(retryResult.error),
            code: retryResult.error.code || ''
          }, { status: 500 });
        }
        
        // Success - return the updated property (without lot/block)
        return NextResponse.json({ property: retryResult.data });
      }
      
      // Other errors
      console.error('Error updating property:', error);
      return NextResponse.json({ 
        error: 'Failed to update property',
        details: errorMessage,
        code: errorCode
      }, { status: 500 });
    }

    return NextResponse.json({ property: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


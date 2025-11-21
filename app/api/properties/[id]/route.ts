import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Category } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
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
    const updateData: any = {};
    if (body.category !== undefined) updateData.category = body.category;
    if (body.title !== undefined) updateData.title = body.title;
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
    if (body.lat !== undefined) updateData.lat = body.lat;
    if (body.lng !== undefined) updateData.lng = body.lng;

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


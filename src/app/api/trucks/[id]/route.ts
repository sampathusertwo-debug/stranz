import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const data = await db.sqlite.getById('trucks', id);
      if (!data) {
        return NextResponse.json({ error: 'Truck not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching truck:', error);
    return NextResponse.json({ error: 'Failed to fetch truck' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      truck_number, 
      vehicle_type_id, 
      ownership_type, 
      capacity_tons, 
      driver_id, 
      status 
    } = body;
    const id = parseInt(params.id);

    const updateData: any = {
      truck_number,
      vehicle_type_id,
      ownership_type,
      capacity_tons,
      driver_id: driver_id || null,
    };

    if (status) {
      updateData.status = status;
    }

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('trucks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const data = await db.sqlite.update('trucks', id, updateData);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating truck:', error);
    return NextResponse.json({ error: 'Failed to update truck' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      await db.sqlite.delete('trucks', id);
    }

    return NextResponse.json({ message: 'Truck deleted successfully' });
  } catch (error) {
    console.error('Error deleting truck:', error);
    return NextResponse.json({ error: 'Failed to delete truck' }, { status: 500 });
  }
}

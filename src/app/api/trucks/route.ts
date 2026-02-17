import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json(data || []);
    } else {
      const data = await db.sqlite.getAll('trucks');
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching trucks:', error);
    return NextResponse.json({ error: 'Failed to fetch trucks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const truckData: any = {
      truck_number,
      vehicle_type_id: vehicle_type_id || null,
      ownership_type: ownership_type || 'MY',
      capacity_tons: capacity_tons || 0,
      driver_id: driver_id || null,
      status: status || 'available',
    };

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('trucks')
        .insert([truckData])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = await db.sqlite.insert('trucks', truckData);
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating truck:', error);
    return NextResponse.json({ error: 'Failed to create truck' }, { status: 500 });
  }
}

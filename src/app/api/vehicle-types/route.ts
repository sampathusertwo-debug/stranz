import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      // Supabase implementation
      const { data, error } = await db.supabase().from('vehicle_types').select('*').order('id');
      if (error) {
        console.error('Supabase error fetching vehicle types:', error);
        throw error;
      }
      console.log('Vehicle types from Supabase:', data);
      return NextResponse.json(data || []);
    } else {
      // SQLite implementation
      const vehicleTypes = await db.sqlite.getAll('vehicle_types');
      console.log('Vehicle types from SQLite:', vehicleTypes);
      return NextResponse.json(vehicleTypes || []);
    }
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    return NextResponse.json({ error:'Failed to fetch vehicle types' }, { status: 500 });
  }
}

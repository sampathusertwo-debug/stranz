import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json(data || []);
    } else {
      const data = await db.sqlite.getAll('drivers');
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, license_number, address, balance } = body;

    const driverData = {
      name,
      phone: phone || '',
      license_number: license_number || '',
      address: address || '',
      balance: balance || 0,
    };

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('drivers')
        .insert([driverData])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = await db.sqlite.insert('drivers', driverData);
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 });
  }
}

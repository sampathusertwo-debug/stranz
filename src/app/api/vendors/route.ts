import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return NextResponse.json(data || []);
    } else {
      const vendors = await db.sqlite.getAll('vendors');
      return NextResponse.json(vendors);
    }
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      alternate_phone,
      email,
      address,
      city,
      state,
      pincode,
      gst_number,
      pan_number,
      contact_person,
      is_active,
      balance,
      notes,
    } = body;

    const vendorData = {
      name,
      phone: phone || '',
      alternate_phone: alternate_phone || '',
      email: email || '',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      gst_number: gst_number || '',
      pan_number: pan_number || '',
      contact_person: contact_person || '',
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
      balance: balance ? parseFloat(balance) : 0,
      notes: notes || '',
    };

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = await db.sqlite.insert('vendors', vendorData);
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

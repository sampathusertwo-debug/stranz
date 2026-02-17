import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          party:parties(name),
          truck:trucks(truck_number),
          driver:drivers(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match frontend expectations
      const transformedData = data?.map((invoice: any) => ({
        ...invoice,
        party_name: invoice.party?.name,
        truck_number: invoice.truck?.truck_number,
        driver_name: invoice.driver?.name,
      })) || [];
      
      return NextResponse.json(transformedData);
    } else {
      const data = await db.sqlite.getAll('invoices');
      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      invoice_number, party_id, truck_id, driver_id, from_location, to_location,
      material, weight, freight_amount, advance_paid, balance_amount, status,
      invoice_date, delivery_date
    } = body;

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number, party_id, truck_id, driver_id, from_location, to_location,
          material, weight, freight_amount, advance_paid, balance_amount, status,
          invoice_date, delivery_date
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = db.sqlite.insert('invoices', {
        invoice_number, party_id, truck_id, driver_id, from_location, to_location,
        material, weight, freight_amount, advance_paid, balance_amount, status,
        invoice_date, delivery_date
      });
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

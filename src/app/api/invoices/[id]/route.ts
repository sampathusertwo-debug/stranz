import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { invoice_number, party_id, truck_id, driver_id, from_location, to_location,
      material, weight, freight_amount, advance_paid, balance_amount, status,
      invoice_date, delivery_date } = body;
    const id = parseInt(params.id);

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('invoices')
        .update({
          invoice_number, party_id, truck_id, driver_id, from_location, to_location,
          material, weight, freight_amount, advance_paid, balance_amount, status,
          invoice_date, delivery_date, updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const data = db.sqlite.update('invoices', id, {
        invoice_number, party_id, truck_id, driver_id, from_location, to_location,
        material, weight, freight_amount, advance_paid, balance_amount, status,
        invoice_date, delivery_date
      });
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
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
        .from('invoices')
        .delete()
        .eq('id', params.id);
      
      if (error) throw error;
    } else {
      await db.sqlite.delete('invoices', id);
    }
    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}

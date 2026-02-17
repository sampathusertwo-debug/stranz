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
        .from('quotes')
        .select(`
          *,
          parties!quotes_party_id_fkey (name),
          vehicle_types!quotes_vehicle_type_id_fkey (name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const quote = {
        ...data,
        party_name: data.parties?.name || '',
        vehicle_type_name: data.vehicle_types?.name || ''
      };
      
      return NextResponse.json(quote);
    } else {
      const quote = await db.sqlite.getById('quotes', id);
      
      if (quote) {
        const party = await db.sqlite.getById('parties', quote.party_id);
        const vehicleType = quote.vehicle_type_id ? await db.sqlite.getById('vehicle_types', quote.vehicle_type_id) : null;
        
        return NextResponse.json({
          ...quote,
          party_name: party?.name || '',
          vehicle_type_name: vehicleType?.name || ''
        });
      }
      
      return NextResponse.json({});
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('quotes')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      await db.sqlite.update('quotes', id, body);
      const quote = await db.sqlite.getById('quotes', id);
      return NextResponse.json(quote);
    }
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
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
        .from('quotes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      await db.sqlite.delete('quotes', id);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}

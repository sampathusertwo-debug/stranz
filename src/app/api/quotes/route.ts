import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          parties!quotes_party_id_fkey (name),
          vehicle_types!quotes_vehicle_type_id_fkey (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const quotes = (data || []).map((quote: any) => ({
        ...quote,
        party_name: quote.parties?.name || '',
        vehicle_type_name: quote.vehicle_types?.name || ''
      }));
      
      return NextResponse.json(quotes);
    } else {
      const quotes = await db.sqlite.getAll('quotes');
      
      const quotesWithDetails = await Promise.all(
        quotes.map(async (quote: any) => {
          const party = await db.sqlite.getById('parties', quote.party_id);
          const vehicleType = quote.vehicle_type_id ? await db.sqlite.getById('vehicle_types', quote.vehicle_type_id) : null;
          return {
            ...quote,
            party_name: party?.name || '',
            vehicle_type_name: vehicleType?.name || ''
          };
        })
      );
      
      return NextResponse.json(quotesWithDetails);
    }
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('quotes')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const id = await db.sqlite.insert('quotes', body);
      const quote = await db.sqlite.getById('quotes', id);
      return NextResponse.json(quote);
    }
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}

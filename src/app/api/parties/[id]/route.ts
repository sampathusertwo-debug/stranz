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
      
      // Get party
      const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (partyError) throw partyError;

      // Get trips for this party to calculate balance
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('balance_amount')
        .eq('party_id', params.id);
      
      if (tripsError) throw tripsError;

      // Calculate balance
      const calculatedBalance = (trips || []).reduce((sum: number, trip: any) => sum + (trip.balance_amount || 0), 0);

      return NextResponse.json({
        ...party,
        balance: calculatedBalance,
      });
    } else {
      const party = await db.sqlite.getById('parties', id);
      if (!party) {
        return NextResponse.json({ error: 'Party not found' }, { status: 404 });
      }

      // Get trips for this party to calculate balance
      const trips = await db.sqlite.getAll('trips');
      const partyTrips = (trips || []).filter((trip: any) => trip.party_id === id);
      const calculatedBalance = partyTrips.reduce((sum: number, trip: any) => sum + (trip.balance_amount || 0), 0);

      return NextResponse.json({
        ...party,
        balance: calculatedBalance,
      });
    }
  } catch (error) {
    console.error('Error fetching party:', error);
    return NextResponse.json({ error: 'Failed to fetch party' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, phone, email, address, gst_number } = body;
    const id = parseInt(params.id);

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('parties')
        .update({ name, phone, email, address, gst_number, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const data = await db.sqlite.update('parties', id, { name, phone, email, address, gst_number });
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating party:', error);
    return NextResponse.json({ error: 'Failed to update party' }, { status: 500 });
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
        .from('parties')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
    } else {
      await db.sqlite.delete('parties', id);
    }
    return NextResponse.json({ message: 'Party deleted successfully' });
  } catch (error) {
    console.error('Error deleting party:', error);
    return NextResponse.json({ error: 'Failed to delete party' }, { status: 500 });
  }
}

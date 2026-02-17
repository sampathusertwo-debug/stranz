import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      
      // Get all parties
      const { data: parties, error: partiesError } = await supabase
        .from('parties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (partiesError) throw partiesError;

      // Get all trips to calculate balances
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('party_id, balance_amount');
      
      if (tripsError) throw tripsError;

      // Calculate balance for each party
      const partiesWithBalance = (parties || []).map((party: any) => {
        const partyTrips = (trips || []).filter((trip: any) => trip.party_id === party.id);
        const calculatedBalance = partyTrips.reduce((sum: number, trip: any) => sum + (trip.balance_amount || 0), 0);
        
        return {
          ...party,
          balance: calculatedBalance,
        };
      });

      return NextResponse.json(partiesWithBalance);
    } else {
      const parties = await db.sqlite.getAll('parties');
      const trips = await db.sqlite.getAll('trips');

      // Calculate balance for each party
      const partiesWithBalance = (parties || []).map((party: any) => {
        const partyTrips = (trips || []).filter((trip: any) => trip.party_id === party.id);
        const calculatedBalance = partyTrips.reduce((sum: number, trip: any) => sum + (trip.balance_amount || 0), 0);
        
        return {
          ...party,
          balance: calculatedBalance,
        };
      });

      return NextResponse.json(partiesWithBalance);
    }
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json({ error: 'Failed to fetch parties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, address, gst_number } = body;

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('parties')
        .insert([{ name, phone, email, address, gst_number }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = await db.sqlite.insert('parties', { name, phone, email, address, gst_number });
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating party:', error);
    return NextResponse.json({ error: 'Failed to create party' }, { status: 500 });
  }
}

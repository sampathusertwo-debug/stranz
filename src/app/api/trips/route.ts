import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          parties (
            id,
            name
          ),
          trucks (
            id,
            truck_number,
            ownership_type
          ),
          drivers (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format data for consistency
      const formattedData = (data || []).map((trip: any) => ({
        ...trip,
        party_name: trip.parties?.name || '',
        truck_number: trip.trucks?.truck_number || '',
        truck_ownership_type: trip.trucks?.ownership_type || '',
        driver_name: trip.drivers?.name || '',
      }));
      
      return NextResponse.json(formattedData);
    } else {
      const trips = await db.sqlite.getAll('trips');
      const parties = await db.sqlite.getAll('parties');
      const trucks = await db.sqlite.getAll('trucks');
      const drivers = await db.sqlite.getAll('drivers');
      
      // Join the data
      const fullTrips = trips.map((trip: any) => {
        const party = parties.find((p: any) => p.id === trip.party_id);
        const truck = trucks.find((t: any) => t.id === trip.truck_id);
        const driver = drivers.find((d: any) => d.id === trip.driver_id);
        
        return {
          ...trip,
          party_name: party?.name || '',
          truck_number: truck?.truck_number || '',
          truck_ownership_type: truck?.ownership_type || '',
          driver_name: driver?.name || '',
        };
      });
      
      return NextResponse.json(fullTrips);
    }
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trip_number,
      party_id,
      truck_id,
      driver_id,
      vehicle_type_id,
      from_location,
      to_location,
      start_date,
      end_date,
      status,
      freight_amount,
      advance_amount,
      balance_amount,
      billing_type,
      material_description,
      weight_tons,
      lr_number,
      start_odometer_reading,
      end_odometer_reading,
      notes,
    } = body;

    // Generate trip number if not provided
    const finalTripNumber = trip_number || `TRP${Date.now()}`;

    // Calculate balance_amount: if not provided, it equals freight_amount - advance_amount
    const freightAmt = freight_amount ? parseFloat(freight_amount) : 0;
    const advanceAmt = advance_amount !== undefined ? parseFloat(advance_amount) : 0;
    const balanceAmt = balance_amount !== undefined ? parseFloat(balance_amount) : (freightAmt - advanceAmt);

    const tripData = {
      trip_number: finalTripNumber,
      party_id: parseInt(party_id),
      truck_id: truck_id ? parseInt(truck_id) : null,
      driver_id: driver_id ? parseInt(driver_id) : null,
      vehicle_type_id: vehicle_type_id ? parseInt(vehicle_type_id) : null,
      from_location: from_location || '',
      to_location: to_location || '',
      start_date: start_date || null,
      end_date: end_date || null,
      status: status || 'booked',
      freight_amount: freightAmt,
      advance_amount: advanceAmt,
      balance_amount: balanceAmt,
      billing_type: billing_type || 'fixed',
      material_description: material_description || '',
      weight_tons: weight_tons ? parseFloat(weight_tons) : 0,
      lr_number: lr_number || '',
      start_odometer_reading: start_odometer_reading ? parseFloat(start_odometer_reading) : null,
      end_odometer_reading: end_odometer_reading ? parseFloat(end_odometer_reading) : null,
      notes: notes || '',
    };

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = await db.sqlite.insert('trips', tripData);
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}

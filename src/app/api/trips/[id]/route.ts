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
        .from('trips')
        .select(`
          *,
          parties (
            id,
            name
          ),
          trucks (
            id,
            truck_number
          ),
          drivers (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const formattedData = {
        ...data,
        party_name: data.parties?.name || '',
        truck_number: data.trucks?.truck_number || '',
        driver_name: data.drivers?.name || '',
      };
      
      return NextResponse.json(formattedData);
    } else {
      const trip = await db.sqlite.getById('trips', id);
      if (!trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }
      
      // Get related data
      const party = trip.party_id ? await db.sqlite.getById('parties', trip.party_id) : null;
      const truck = trip.truck_id ? await db.sqlite.getById('trucks', trip.truck_id) : null;
      const driver = trip.driver_id ? await db.sqlite.getById('drivers', trip.driver_id) : null;
      
      return NextResponse.json({
        ...trip,
        party_name: party?.name || '',
        truck_number: truck?.truck_number || '',
        driver_name: driver?.name || '',
      });
    }
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
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

    // Calculate balance_amount: if not provided, it equals freight_amount - advance_amount
    const freightAmt = freight_amount ? parseFloat(freight_amount) : 0;
    const advanceAmt = advance_amount !== undefined ? parseFloat(advance_amount) : 0;
    const balanceAmt = balance_amount !== undefined ? parseFloat(balance_amount) : (freightAmt - advanceAmt);

    const tripData = {
      trip_number,
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
        .update(tripData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const data = await db.sqlite.update('trips', id, tripData);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
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
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ message: 'Trip deleted successfully' });
    } else {
      await db.sqlite.delete('trips', id);
      return NextResponse.json({ message: 'Trip deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}

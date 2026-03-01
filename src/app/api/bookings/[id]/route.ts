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
      
      // Fetch booking without joins
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (bookingError) throw bookingError;
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      
      // Fetch related data separately
      let party = null, truck = null, driver = null;
      
      if (booking.party_id) {
        const { data } = await supabase.from('parties').select('id, name').eq('id', booking.party_id).single();
        party = data;
      }
      
      if (booking.truck_id) {
        const { data } = await supabase.from('trucks').select('id, truck_number').eq('id', booking.truck_id).single();
        truck = data;
      }
      
      if (booking.driver_id) {
        const { data } = await supabase.from('drivers').select('id, name').eq('id', booking.driver_id).single();
        driver = data;
      }
      
      const formattedData = {
        ...booking,
        party_name: party?.name || '',
        truck_number: truck?.truck_number || '',
        driver_name: driver?.name || '',
      };
      
      return NextResponse.json(formattedData);
    } else {
      const booking = await db.sqlite.getById('bookings', id);
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      
      // Get related data
      const party = booking.party_id ? await db.sqlite.getById('parties', booking.party_id) : null;
      const truck = booking.truck_id ? await db.sqlite.getById('trucks', booking.truck_id) : null;
      const driver = booking.driver_id ? await db.sqlite.getById('drivers', booking.driver_id) : null;
      
      return NextResponse.json({
        ...booking,
        party_name: party?.name || '',
        truck_number: truck?.truck_number || '',
        driver_name: driver?.name || '',
      });
    }
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
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
      booking_number,
      party_id,
      truck_id,
      driver_id,
      vehicle_type_id,
      from_location,
      to_location,
      start_date,
      status,
      total_amount,
      billing_type,
      material_description,
      weight_tons,
      lr_number,
      notes,
    } = body;

    const totalAmt = total_amount !== undefined ? parseFloat(total_amount) : 0;

    const bookingData = {
      booking_number,
      party_id: parseInt(party_id),
      truck_id: truck_id ? parseInt(truck_id) : null,
      driver_id: driver_id ? parseInt(driver_id) : null,
      vehicle_type_id: vehicle_type_id ? parseInt(vehicle_type_id) : null,
      from_location: from_location || '',
      to_location: to_location || '',
      booking_date: new Date().toISOString(),
      start_date: start_date || null,
      status: status || 'booked',
      total_amount: totalAmt,
      billing_type: billing_type || 'fixed',
      material_description: material_description || '',
      weight_tons: weight_tons ? parseFloat(weight_tons) : 0,
      lr_number: lr_number || '',
      notes: notes || '',
    };

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const data = await db.sqlite.update('bookings', id, bookingData);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
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
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ message: 'Booking deleted successfully' });
    } else {
      await db.sqlite.delete('bookings', id);
      return NextResponse.json({ message: 'Booking deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/booking-vehicles?booking_id=X - Get all vehicles for a booking
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('booking_vehicles')
        .select(`
          *,
          vehicle_types (id, name),
          trucks (id, truck_number),
          vendors (id, name),
          drivers (id, name, phone)
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform nested data to flat structure
      const transformedData = (data || []).map((vehicle: any) => ({
        ...vehicle,
        vehicle_type_name: vehicle.vehicle_types?.name || '',
        truck_number: vehicle.trucks?.truck_number || '',
        vendor_name: vehicle.vendors?.name || '',
        driver_name: vehicle.drivers?.name || '',
        driver_phone: vehicle.drivers?.phone || '',
      }));
      
      return NextResponse.json(transformedData);
    } else {
      const vehicles = await db.sqlite.getAll('booking_vehicles');
      const filteredVehicles = vehicles.filter((v: any) => v.booking_id === parseInt(bookingId));
      return NextResponse.json(filteredVehicles);
    }
  } catch (error: any) {
    console.error('Error fetching booking vehicles:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking vehicles' },
      { status: 500 }
    );
  }
}

// POST /api/booking-vehicles - Create new booking vehicle entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      booking_id,
      vehicle_type_id,
      vehicle_source,
      truck_id,
      vendor_id,
      vehicle_number,
      driver_id,
      driver_name,
      driver_phone,
      amount,
      notes,
    } = body;

    const vehicleData = {
      booking_id: parseInt(booking_id),
      vehicle_type_id: parseInt(vehicle_type_id),
      vehicle_source: vehicle_source || 'own',
      truck_id: truck_id ? parseInt(truck_id) : null,
      vendor_id: vendor_id ? parseInt(vendor_id) : null,
      vehicle_number: vehicle_number || null,
      driver_id: driver_id ? parseInt(driver_id) : null,
      driver_name: driver_name || null,
      driver_phone: driver_phone || null,
      amount: amount ? parseFloat(amount) : null,
      notes: notes || null,
    };

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('booking_vehicles')
        .insert([vehicleData])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const id = await db.sqlite.insert('booking_vehicles', vehicleData);
      return NextResponse.json({ id, ...vehicleData });
    }
  } catch (error: any) {
    console.error('Error creating booking vehicle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking vehicle' },
      { status: 500 }
    );
  }
}

// DELETE /api/booking-vehicles?id=X - Delete a booking vehicle entry
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 });
    }

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { error } = await supabase
        .from('booking_vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } else {
      await db.sqlite.delete('booking_vehicles', parseInt(id));
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error('Error deleting booking vehicle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete booking vehicle' },
      { status: 500 }
    );
  }
}

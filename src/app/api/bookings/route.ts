import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      
      // Fetch bookings without joins
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (bookingsError) throw bookingsError;
      
      // Fetch related data separately
      const { data: parties } = await supabase.from('parties').select('id, name');
      const { data: trucks } = await supabase.from('trucks').select('id, truck_number, ownership_type');
      const { data: drivers } = await supabase.from('drivers').select('id, name');
      
      // Manual join
      const formattedData = (bookings || []).map((booking: any) => {
        const party = parties?.find((p: any) => p.id === booking.party_id);
        const truck = trucks?.find((t: any) => t.id === booking.truck_id);
        const driver = drivers?.find((d: any) => d.id === booking.driver_id);
        
        return {
          ...booking,
          party_name: party?.name || '',
          truck_number: truck?.truck_number || '',
          truck_ownership_type: truck?.ownership_type || '',
          driver_name: driver?.name || '',
        };
      });
      
      return NextResponse.json(formattedData);
    } else {
      const bookings = await db.sqlite.getAll('bookings');
      const parties = await db.sqlite.getAll('parties');
      const trucks = await db.sqlite.getAll('trucks');
      const drivers = await db.sqlite.getAll('drivers');
      
      // Join the data
      const fullBookings = bookings.map((booking: any) => {
        const party = parties.find((p: any) => p.id === booking.party_id);
        const truck = trucks.find((t: any) => t.id === booking.truck_id);
        const driver = drivers.find((d: any) => d.id === booking.driver_id);
        
        return {
          ...booking,
          party_name: party?.name || '',
          truck_number: truck?.truck_number || '',
          truck_ownership_type: truck?.ownership_type || '',
          driver_name: driver?.name || '',
        };
      });
      
      return NextResponse.json(fullBookings);
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Generate booking number if not provided
    // Format: STZB{FY}-{SEQ} (e.g., STZB2526-00001)
    let finalBookingNumber = booking_number;
    if (!finalBookingNumber) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-11
      // Financial year: April to March (month >= 3 means April to December)
      const financialYear = month >= 3 ? year : year - 1;
      const fyShort = `${(financialYear % 100).toString().padStart(2, '0')}${((financialYear + 1) % 100).toString().padStart(2, '0')}`;
      
      // Get the last booking number for this financial year
      if (db.isUsingSupabase()) {
        const supabase = db.supabase();
        const { data } = await supabase
          .from('bookings')
          .select('booking_number')
          .like('booking_number', `STZB${fyShort}-%`)
          .order('booking_number', { ascending: false })
          .limit(1)
          .single();
        
        let sequenceNumber = 1;
        if (data?.booking_number) {
          const lastSeq = parseInt(data.booking_number.split('-')[1]);
          sequenceNumber = lastSeq + 1;
        }
        finalBookingNumber = `STZB${fyShort}-${sequenceNumber.toString().padStart(5, '0')}`;
      } else {
        const bookings = await db.sqlite.getAll('bookings');
        const currentFYBookings = bookings.filter((b: any) => 
          b.booking_number && b.booking_number.startsWith(`STZB${fyShort}-`)
        );
        let sequenceNumber = 1;
        if (currentFYBookings.length > 0) {
          const lastBooking = currentFYBookings.sort((a: any, b: any) => 
            b.booking_number.localeCompare(a.booking_number)
          )[0];
          const lastSeq = parseInt(lastBooking.booking_number.split('-')[1]);
          sequenceNumber = lastSeq + 1;
        }
        finalBookingNumber = `STZB${fyShort}-${sequenceNumber.toString().padStart(5, '0')}`;
      }
    }

    const totalAmt = total_amount !== undefined ? parseFloat(total_amount) : 0;

    const bookingData = {
      booking_number: finalBookingNumber,
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
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = await db.sqlite.insert('bookings', bookingData);
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

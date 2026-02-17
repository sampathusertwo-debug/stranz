import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          trip:trips(trip_number),
          truck:trucks(truck_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data
      const transformedData = data?.map((expense: any) => ({
        ...expense,
        trip_number: expense.trip?.trip_number,
        truck_number: expense.truck?.truck_number,
      })) || [];
      
      return NextResponse.json(transformedData);
    } else {
      const data = await db.sqlite.getAll('expenses');
      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice_id, truck_id, trip_id, expense_type, amount, description, expense_date } = body;

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ invoice_id, truck_id, trip_id, expense_type, amount, description, expense_date }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = db.sqlite.insert('expenses', { invoice_id, truck_id, trip_id, expense_type, amount, description, expense_date });
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

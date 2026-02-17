import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          driver:drivers(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data
      const transformedData = data?.map((tip: any) => ({
        ...tip,
        driver_name: tip.driver?.name,
      })) || [];
      
      return NextResponse.json(transformedData);
    } else {
      const data = await db.sqlite.getAll('tips');
      return NextResponse.json(data || []);
    }
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driver_id, amount, description, tip_date } = body;

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('tips')
        .insert([{ driver_id, amount, description, tip_date }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } else {
      const data = db.sqlite.insert('tips', { driver_id, amount, description, tip_date });
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json({ error: 'Failed to create tip' }, { status: 500 });
  }
}

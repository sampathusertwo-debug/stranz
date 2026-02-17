import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    if (db.isUsingSupabase()) {
      // Supabase implementation
      const { data, error } = await db.supabase().from('status_types').select('*').order('id');
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // SQLite implementation
      const statusTypes = await db.sqlite.getAll('status_types');
      return NextResponse.json(statusTypes);
    }
  } catch (error) {
    console.error('Error fetching status types:', error);
    return NextResponse.json({ error: 'Failed to fetch status types' }, { status: 500 });
  }
}

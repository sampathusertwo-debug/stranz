import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { driver_id, amount, description, tip_date } = body;
    const id = parseInt(params.id);

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('tips')
        .update({ driver_id, amount, description, tip_date, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const data = await db.sqlite.update('tips', id, { driver_id, amount, description, tip_date });
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating tip:', error);
    return NextResponse.json({ error: 'Failed to update tip' }, { status: 500 });
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
        .from('tips')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
    } else {
      await db.sqlite.delete('tips', id);
    }
    return NextResponse.json({ message: 'Tip deleted successfully' });
  } catch (error) {
    console.error('Error deleting tip:', error);
    return NextResponse.json({ error: 'Failed to delete tip' }, { status: 500 });
  }
}

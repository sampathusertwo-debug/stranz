import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { invoice_id, truck_id, expense_type, amount, description, expense_date } = body;
    const id = parseInt(params.id);

    if (db.isUsingSupabase()) {
      const supabase = db.supabase();
      const { data, error } = await supabase
        .from('expenses')
        .update({ invoice_id, truck_id, expense_type, amount, description, expense_date, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const data = await db.sqlite.update('expenses', id, { invoice_id, truck_id, expense_type, amount, description, expense_date });
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
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
        .from('expenses')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
    } else {
      await db.sqlite.delete('expenses', id);
    }
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}

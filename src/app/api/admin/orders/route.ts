import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { Order } from '@/types';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const orders = readData<Order[]>('orders.json');
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to read orders' }, { status: 500 });
  }
}

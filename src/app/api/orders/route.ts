import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerName, customerEmail, message } = body;

    if (!items || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orders = readData<Order[]>('orders.json');
    const newOrder: Order = {
      id: uuidv4(),
      items,
      customerName,
      customerEmail,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    writeData('orders.json', orders);

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch {
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

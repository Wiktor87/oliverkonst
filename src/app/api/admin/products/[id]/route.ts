import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { Product } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const products = readData<Product[]>('products.json');
    const index = products.findIndex((p) => p.id === params.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    products[index] = { ...products[index], ...body, updatedAt: new Date().toISOString() };
    writeData('products.json', products);
    return NextResponse.json(products[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const products = readData<Product[]>('products.json');
    const filtered = products.filter((p) => p.id !== params.id);
    if (filtered.length === products.length) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    writeData('products.json', filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

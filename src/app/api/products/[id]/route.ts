import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/data';
import { Product } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const products = readData<Product[]>('products.json');
    const product = products.find((p) => p.id === params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to read product' }, { status: 500 });
  }
}

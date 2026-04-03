import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/data';
import { Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const products = readData<Product[]>('products.json');
    const filtered = category ? products.filter((p) => p.category === category) : products;
    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const products = readData<Product[]>('products.json');
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const products = readData<Product[]>('products.json');
    const newProduct: Product = {
      ...body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    writeData('products.json', products);
    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

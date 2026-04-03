import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';
import { Category } from '@/types';

export async function GET() {
  try {
    const categories = readData<Category[]>('categories.json');
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
  }
}

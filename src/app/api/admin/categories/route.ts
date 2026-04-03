import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { Category } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const categories = readData<Category[]>('categories.json');
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const categories = readData<Category[]>('categories.json');
    const newCategory: Category = {
      id: body.id || uuidv4(),
      name: body.name,
    };
    categories.push(newCategory);
    writeData('categories.json', categories);
    return NextResponse.json(newCategory, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

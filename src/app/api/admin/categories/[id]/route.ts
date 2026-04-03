import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { Category } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const categories = readData<Category[]>('categories.json');
    const index = categories.findIndex((c) => c.id === params.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    categories[index] = { ...categories[index], ...body };
    writeData('categories.json', categories);
    return NextResponse.json(categories[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const categories = readData<Category[]>('categories.json');
    const filtered = categories.filter((c) => c.id !== params.id);
    if (filtered.length === categories.length) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    writeData('categories.json', filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

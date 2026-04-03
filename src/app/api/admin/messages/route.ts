import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { Message } from '@/types';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const messages = readData<Message[]>('messages.json');
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: 'Failed to read messages' }, { status: 500 });
  }
}

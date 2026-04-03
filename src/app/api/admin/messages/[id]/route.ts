import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { Message } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const messages = readData<Message[]>('messages.json');
    const index = messages.findIndex((m) => m.id === params.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    messages[index] = { ...messages[index], ...body };
    writeData('messages.json', messages);
    return NextResponse.json(messages[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const messages = readData<Message[]>('messages.json');
    const newMessage: Message = {
      id: uuidv4(),
      name,
      email,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    writeData('messages.json', messages);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

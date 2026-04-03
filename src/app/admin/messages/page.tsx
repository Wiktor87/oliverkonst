'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Message } from '@/types';

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/admin/messages')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setMessages(data.reverse()); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id: string) => {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    fetchData();
  };

  if (loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl text-stone-800 mb-6">Meddelanden</h1>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white rounded-lg border border-stone-100 p-8 text-center text-stone-400">
            Inga meddelanden
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`bg-white rounded-lg border p-5 ${!m.read ? 'border-amber-200 shadow-sm' : 'border-stone-100'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {!m.read && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />}
                  <div>
                    <p className="font-medium text-stone-800">{m.name}</p>
                    <p className="text-sm text-stone-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-xs text-stone-400">{new Date(m.createdAt).toLocaleDateString('sv-SE')}</p>
                  {!m.read && (
                    <button
                      onClick={() => markRead(m.id)}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded transition-colors"
                    >
                      Markera som läst
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

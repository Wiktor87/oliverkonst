'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Message } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile, writeJsonFile } from '@/lib/github';

export default function AdminMessagesPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAdmin();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = async (t: string) => {
    const { data } = await readJsonFile<Message[]>(t, 'data/messages.json');
    setMessages([...data].reverse());
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }
    fetchData(token).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, token, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id: string) => {
    if (!token) return;
    setUpdating(true);
    try {
      const { data, sha } = await readJsonFile<Message[]>(token, 'data/messages.json');
      const updated = data.map((m) => (m.id === id ? { ...m, read: true } : m));
      await writeJsonFile(token, 'data/messages.json', updated, sha, `Admin: markera meddelande ${id} som läst`);
      setMessages([...updated].reverse());
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || loading) return <div className="p-8 text-stone-500">Laddar...</div>;

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
                      disabled={updating}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded transition-colors disabled:opacity-50"
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

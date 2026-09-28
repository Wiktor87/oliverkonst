'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile } from '@/lib/github';
import { StripeOrder, fetchStripeOrders, getStoredStripeKey, storeStripeKey } from '@/lib/stripeOrders';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [stripeKey, setStripeKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [stripeOrders, setStripeOrders] = useState<StripeOrder[]>([]);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }
    readJsonFile<Order[]>(token, 'data/orders.json')
      .then(({ data }) => setOrders([...data].reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, token, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStripeOrders = useCallback(async (key: string) => {
    setStripeLoading(true);
    setStripeError('');
    try {
      setStripeOrders(await fetchStripeOrders(key));
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : 'Kunde inte hämta beställningar från Stripe');
    } finally {
      setStripeLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredStripeKey();
    if (stored) {
      setStripeKey(stored);
      loadStripeOrders(stored);
    }
  }, [loadStripeOrders]);

  const saveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    storeStripeKey(key);
    setStripeKey(key);
    setKeyInput('');
    loadStripeOrders(key);
  };

  const removeKey = () => {
    storeStripeKey('');
    setStripeKey('');
    setStripeOrders([]);
    setStripeError('');
  };

  if (isLoading || loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl text-stone-800 mb-6">Beställningar</h1>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium text-stone-700">Stripe-betalningar</h2>
        {stripeKey && (
          <div className="flex gap-4 text-xs">
            <button onClick={() => loadStripeOrders(stripeKey)} className="text-amber-700 hover:text-amber-900">
              Uppdatera
            </button>
            <button onClick={removeKey} className="text-stone-500 hover:text-red-700">
              Ta bort Stripe-nyckel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden mb-10">
        {!stripeKey ? (
          <form onSubmit={saveKey} className="p-6 space-y-3 text-sm text-stone-600">
            <p>
              Köp via Stripe betalas direkt hos Stripe och hämtas därför härifrån. Skapa en
              <strong> begränsad nyckel</strong> i Stripe Dashboard (Utvecklare → API-nycklar → Skapa begränsad nyckel)
              med endast <strong>Läs</strong>-behörighet för <em>Checkout Sessions</em>, och klistra in den nedan.
            </p>
            <p className="text-xs text-stone-400">
              Nyckeln sparas bara i den här webbläsaren och skickas aldrig till GitHub.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex-1 border border-stone-200 rounded px-3 py-2"
                placeholder="rk_live_..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <button type="submit" className="bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-700">
                Spara
              </button>
            </div>
          </form>
        ) : stripeLoading ? (
          <p className="p-8 text-center text-stone-400">Hämtar från Stripe...</p>
        ) : stripeError ? (
          <p className="p-8 text-center text-red-700">{stripeError}</p>
        ) : stripeOrders.length === 0 ? (
          <p className="p-8 text-center text-stone-400">Inga Stripe-betalningar</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-4 py-3 font-medium text-stone-600">Kund</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Kontakt</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Artiklar</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Leverans</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Totalt</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Datum</th>
              </tr>
            </thead>
            <tbody>
              {stripeOrders.map((order) => (
                <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50 align-top">
                  <td className="px-4 py-3 text-stone-800 font-medium">{order.customerName || '–'}</td>
                  <td className="px-4 py-3 text-stone-600">
                    <div>{order.customerEmail}</div>
                    {order.customerPhone && <div>{order.customerPhone}</div>}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {order.items.length === 0
                      ? '–'
                      : order.items.map((i, idx) => (
                          <div key={idx}>{i.description} ×{i.quantity}</div>
                        ))}
                  </td>
                  <td className="px-4 py-3 text-stone-600 max-w-xs">
                    {order.address && <div>{order.address}</div>}
                    {order.reference && <div className="text-xs text-stone-400 break-words">{order.reference}</div>}
                  </td>
                  <td className="px-4 py-3 text-stone-800 whitespace-nowrap">
                    {order.amountTotal.toLocaleString('sv-SE')} {order.currency}
                  </td>
                  <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="font-medium text-stone-700 mb-3">Övriga beställningar</h2>
      <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-stone-400">Inga beställningar</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-4 py-3 font-medium text-stone-600">Kund</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">E-post</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Artiklar</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Totalt</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Datum</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
                return (
                  <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-800 font-medium">{order.customerName}</td>
                    <td className="px-4 py-3 text-stone-600">{order.customerEmail}</td>
                    <td className="px-4 py-3 text-stone-600">{order.items.length} st</td>
                    <td className="px-4 py-3 text-stone-800">{total.toLocaleString('sv-SE')} SEK</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

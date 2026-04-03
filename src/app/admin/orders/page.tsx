'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setOrders(data.reverse()); })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl text-stone-800 mb-6">Beställningar</h1>

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

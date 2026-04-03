'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, Message, Order } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile } from '@/lib/github';

export default function AdminDashboard() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }

    Promise.all([
      readJsonFile<Product[]>(token, 'data/products.json'),
      readJsonFile<Category[]>(token, 'data/categories.json'),
      readJsonFile<Message[]>(token, 'data/messages.json'),
      readJsonFile<Order[]>(token, 'data/orders.json'),
    ])
      .then(([p, c, m, o]) => {
        setProducts(p.data);
        setCategories(c.data);
        setMessages(m.data);
        setOrders(o.data);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [isAuthenticated, isLoading, token, router]);

  if (isLoading || dataLoading) {
    return <div className="p-8 text-stone-500">Laddar...</div>;
  }

  const unreadMessages = messages.filter((m) => !m.read).length;
  const availableProducts = products.filter((p) => p.status === 'available').length;

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl text-stone-800 mb-8">Dashboard</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-sm text-blue-800">
        <p className="font-semibold mb-1">ℹ️ Hur admin-panelen fungerar</p>
        <p>
          Ändringar du gör här sparas direkt till GitHub-repot via GitHub API (som commits).
          Det triggar automatiskt en ny GitHub Actions-byggning som uppdaterar den publika webbplatsen
          inom några minuter.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Produkter" value={products.length} sub={`${availableProducts} tillgängliga`} href="/admin/products" color="amber" />
        <StatCard title="Meddelanden" value={messages.length} sub={`${unreadMessages} olästa`} href="/admin/messages" color="blue" />
        <StatCard title="Beställningar" value={orders.length} sub="totalt" href="/admin/orders" color="green" />
        <StatCard title="Kategorier" value={categories.length} sub="se kategorier" href="/admin/categories" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6">
          <h2 className="font-medium text-stone-700 mb-4">Senaste meddelanden</h2>
          {messages.length === 0 ? (
            <p className="text-sm text-stone-400">Inga meddelanden</p>
          ) : (
            <ul className="space-y-3">
              {messages.slice(-5).reverse().map((m) => (
                <li key={m.id} className="flex items-start gap-2 text-sm">
                  {!m.read && <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />}
                  <div className={m.read ? 'opacity-60' : ''}>
                    <p className="font-medium text-stone-700">{m.name}</p>
                    <p className="text-stone-500 truncate">{m.message.slice(0, 60)}...</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/messages" className="text-xs text-amber-700 hover:text-amber-900 mt-4 inline-block">
            Visa alla →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6">
          <h2 className="font-medium text-stone-700 mb-4">Snabblänkar</h2>
          <div className="space-y-2">
            <Link href="/admin/products" className="block text-sm text-stone-600 hover:text-amber-700 py-1">→ Lägg till ny produkt</Link>
            <Link href="/admin/categories" className="block text-sm text-stone-600 hover:text-amber-700 py-1">→ Hantera kategorier</Link>
            <Link href="/admin/messages" className="block text-sm text-stone-600 hover:text-amber-700 py-1">→ Läs meddelanden</Link>
            <Link href="/admin/orders" className="block text-sm text-stone-600 hover:text-amber-700 py-1">→ Se beställningar</Link>
            <Link href="/" className="block text-sm text-stone-600 hover:text-amber-700 py-1">→ Besök webbplatsen</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title, value, sub, href, color,
}: {
  title: string;
  value: number;
  sub: string;
  href: string;
  color: 'amber' | 'blue' | 'green' | 'purple';
}) {
  const colors = {
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    blue: 'bg-blue-50 text-blue-800 border-blue-100',
    green: 'bg-green-50 text-green-800 border-green-100',
    purple: 'bg-purple-50 text-purple-800 border-purple-100',
  };
  return (
    <Link href={href} className={`rounded-lg border p-5 block hover:shadow-sm transition-shadow ${colors[color]}`}>
      <p className="text-sm font-medium opacity-70">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </Link>
  );
}

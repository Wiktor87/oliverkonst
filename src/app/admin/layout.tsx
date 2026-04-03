import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  const isAuthenticated = session?.value === 'authenticated';

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {isAuthenticated && (
        <aside className="w-56 bg-stone-900 text-white flex flex-col min-h-screen fixed top-0 left-0">
          <div className="p-4 border-b border-stone-700">
            <Link href="/admin" className="font-serif text-lg text-amber-400">Admin Panel</Link>
            <p className="text-xs text-stone-400 mt-1">Oliver&apos;s Konst</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/admin" className="block px-3 py-2 rounded text-sm text-stone-300 hover:bg-stone-700 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/products" className="block px-3 py-2 rounded text-sm text-stone-300 hover:bg-stone-700 hover:text-white transition-colors">
              Produkter
            </Link>
            <Link href="/admin/categories" className="block px-3 py-2 rounded text-sm text-stone-300 hover:bg-stone-700 hover:text-white transition-colors">
              Kategorier
            </Link>
            <Link href="/admin/messages" className="block px-3 py-2 rounded text-sm text-stone-300 hover:bg-stone-700 hover:text-white transition-colors">
              Meddelanden
            </Link>
            <Link href="/admin/orders" className="block px-3 py-2 rounded text-sm text-stone-300 hover:bg-stone-700 hover:text-white transition-colors">
              Beställningar
            </Link>
          </nav>
          <div className="p-4 border-t border-stone-700">
            <Link href="/admin/logout" className="text-sm text-stone-400 hover:text-white transition-colors">
              Logga ut
            </Link>
          </div>
        </aside>
      )}
      <div className={`flex-1 ${isAuthenticated ? 'ml-56' : ''}`}>{children}</div>
    </div>
  );
}


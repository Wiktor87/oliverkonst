'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/logout', { method: 'POST' }).then(() => {
      router.push('/admin/login');
      router.refresh();
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-stone-500">Loggar ut...</p>
    </div>
  );
}

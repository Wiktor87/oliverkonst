'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/components/AdminContext';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAdmin();

  useEffect(() => {
    logout();
    router.push('/admin/login');
  }, [logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-stone-500">Loggar ut...</p>
    </div>
  );
}

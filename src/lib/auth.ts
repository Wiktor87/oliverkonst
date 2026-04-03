import { cookies } from 'next/headers';

export function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export function requireAuth(): Response | null {
  if (!isAuthenticated()) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

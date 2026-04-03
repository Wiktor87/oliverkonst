'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/components/AdminContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdmin();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(token.trim());
      router.push('/admin');
    } catch {
      setError('Ogiltig token. Kontrollera att din GitHub PAT är korrekt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-amber-800 mb-2">Oliver&apos;s Konst</h1>
          <p className="text-stone-500 text-sm">Admin-inloggning</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-8">
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 text-xs text-amber-800 space-y-1">
            <p className="font-semibold">GitHub Personal Access Token (PAT) krävs</p>
            <p>
              Logga in med ett PAT som har <code className="bg-amber-100 px-0.5 rounded">repo</code>-behörighet till{' '}
              <strong>Wiktor87/oliverkonst</strong>.
            </p>
            <p>
              Skapa en PAT under{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=OliverKonst+Admin"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-amber-900"
              >
                GitHub → Settings → Developer settings → Personal access tokens
              </a>
              .
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                placeholder="ghp_xxxxxxxxxxxx"
                className="input-field font-mono text-sm"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifierar...' : 'Logga in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

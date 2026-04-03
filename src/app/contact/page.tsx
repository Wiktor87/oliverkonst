'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl text-stone-800 mb-3">{t.contact.title}</h1>
        <p className="text-stone-500">{t.contact.subtitle}</p>
      </div>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">{t.contact.success}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t.contact.name}</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.contact.namePlaceholder}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t.contact.email}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t.contact.emailPlaceholder}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t.contact.message}</label>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={t.contact.messagePlaceholder}
              className="input-field resize-none"
            />
          </div>
          {status === 'error' && (
            <p className="text-red-600 text-sm">{t.contact.error}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? t.common.loading : t.contact.send}
          </button>
        </form>
      )}
    </div>
  );
}

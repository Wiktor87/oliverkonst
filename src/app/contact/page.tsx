'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { siteConfig } from '@/lib/config';

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Meddelande från ${form.name}`);
    const body = encodeURIComponent(
      `Namn: ${form.name}\nE-post: ${form.email}\n\n${form.message}`,
    );
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl text-stone-800 mb-3">{t.contact.title}</h1>
        <p className="text-stone-500">{t.contact.subtitle}</p>
      </div>

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
        <div className="text-sm text-stone-500 bg-amber-50 border border-amber-100 rounded p-3">
          {t.contact.mailtoNote}
        </div>
        <button type="submit" className="w-full btn-primary">
          {t.contact.send}
        </button>
      </form>
    </div>
  );
}

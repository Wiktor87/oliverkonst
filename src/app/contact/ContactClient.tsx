'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { siteConfig } from '@/lib/config';

export default function ContactClient() {
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
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.contact.title}</h1>
        <p className="page-subtitle">{t.contact.subtitle}</p>
      </div>

      <div className="contact-layout">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">{t.contact.name}</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.contact.namePlaceholder}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label className="input-label">{t.contact.email}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t.contact.emailPlaceholder}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label className="input-label">{t.contact.message}</label>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={t.contact.messagePlaceholder}
              className="input-field"
            />
          </div>
          <p className="form-note">{t.contact.mailtoNote}</p>
          <button type="submit" className="btn-primary btn-full">
            {t.contact.send}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteContent } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile, writeJsonFile } from '@/lib/github';

const defaultContent: SiteContent = {
  biography: { sv: '', en: '' },
  profileQuote: { sv: '', en: '' },
  aboutTitle: { sv: '', en: '' },
  contactEmail: '',
  socialLinks: { instagram: '', facebook: '' },
};

export default function AdminContentPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAdmin();
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [sha, setSha] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }
    readJsonFile<SiteContent>(token, 'data/site-content.json')
      .then(({ data, sha: s }) => {
        setContent(data);
        setSha(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, token, router]);

  const set = (path: string[], val: string) => {
    setContent((prev) => {
      const next = { ...prev } as Record<string, unknown>;
      if (path.length === 1) {
        next[path[0]] = val;
      } else if (path.length === 2) {
        const parent = { ...(next[path[0]] as Record<string, string>) };
        parent[path[1]] = val;
        next[path[0]] = parent;
      }
      return next as unknown as SiteContent;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const newSha = await writeJsonFile(token, 'data/site-content.json', content, sha, 'Admin: uppdatera webbplatsinnehåll');
      setSha(newSha);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError('Sparning misslyckades: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-serif text-3xl text-stone-800 mb-6">Redigera innehåll</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
        Ändringar syns på webbplatsen efter nästa bygge (vanligtvis 1–2 minuter).
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Biography */}
        <section className="bg-white rounded-lg border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">Biografi</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Biografi (svenska)</label>
              <textarea
                className="input-field"
                rows={6}
                value={content.biography.sv}
                onChange={(e) => set(['biography', 'sv'], e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Biografi (engelska)</label>
              <textarea
                className="input-field"
                rows={6}
                value={content.biography.en}
                onChange={(e) => set(['biography', 'en'], e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="bg-white rounded-lg border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">Profilcitat</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Citat (svenska)</label>
              <textarea
                className="input-field"
                rows={3}
                value={content.profileQuote.sv}
                onChange={(e) => set(['profileQuote', 'sv'], e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Citat (engelska)</label>
              <textarea
                className="input-field"
                rows={3}
                value={content.profileQuote.en}
                onChange={(e) => set(['profileQuote', 'en'], e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* About title */}
        <section className="bg-white rounded-lg border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">Om-rubrik</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Svenska</label>
              <input
                className="input-field"
                value={content.aboutTitle.sv}
                onChange={(e) => set(['aboutTitle', 'sv'], e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Engelska</label>
              <input
                className="input-field"
                value={content.aboutTitle.en}
                onChange={(e) => set(['aboutTitle', 'en'], e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Contact & social */}
        <section className="bg-white rounded-lg border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">Kontakt & sociala medier</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Kontakt-e-post</label>
              <input
                type="email"
                className="input-field"
                value={content.contactEmail}
                onChange={(e) => set(['contactEmail'], e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Instagram (URL)</label>
                <input
                  className="input-field"
                  value={content.socialLinks.instagram}
                  onChange={(e) => set(['socialLinks', 'instagram'], e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Facebook (URL)</label>
                <input
                  className="input-field"
                  value={content.socialLinks.facebook}
                  onChange={(e) => set(['socialLinks', 'facebook'], e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>
        </section>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        {saveSuccess && <p className="text-sm text-green-600">✓ Sparad! Webbplatsen bygger om inom 1–2 minuter.</p>}

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Sparar till GitHub...' : 'Spara innehåll'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SiteContent, Product } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile, writeJsonFile } from '@/lib/github';
import { publicUrl } from '@/lib/config';

const MAX_SELECTED = 6;

const defaultContent: SiteContent = {
  biography: { sv: '', en: '' },
  profileQuote: { sv: '', en: '' },
  aboutTitle: { sv: '', en: '' },
  contactEmail: '',
  contactPhone: '',
  contactAddress: { sv: '', en: '' },
  socialLinks: { instagram: '', facebook: '' },
  selectedProducts: [],
  notificationEmails: '',
  purchaseTerms: { sv: '', en: '' },
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }
    Promise.all([
      readJsonFile<SiteContent>(token, 'data/site-content.json'),
      readJsonFile<Product[]>(token, 'data/products.json'),
    ])
      .then(([contentRes, productsRes]) => {
        setContent({ ...defaultContent, ...contentRes.data });
        setSha(contentRes.sha);
        setAllProducts(productsRes.data);
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

  const selected = content.selectedProducts ?? [];

  const toggleProduct = (id: string) => {
    setContent((prev) => {
      const current = prev.selectedProducts ?? [];
      if (current.includes(id)) {
        return { ...prev, selectedProducts: current.filter((pid) => pid !== id) };
      }
      if (current.length >= MAX_SELECTED) return prev;
      return { ...prev, selectedProducts: [...current, id] };
    });
  };

  const removeSelected = (id: string) => {
    setContent((prev) => ({
      ...prev,
      selectedProducts: (prev.selectedProducts ?? []).filter((pid) => pid !== id),
    }));
  };

  const moveSelected = (id: string, dir: -1 | 1) => {
    setContent((prev) => {
      const arr = [...(prev.selectedProducts ?? [])];
      const idx = arr.indexOf(id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return { ...prev, selectedProducts: arr };
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
              <label className="block text-sm font-medium text-stone-700 mb-1">Kontakt-e-post (visas på sidan)</label>
              <input
                type="email"
                className="input-field"
                value={content.contactEmail}
                onChange={(e) => set(['contactEmail'], e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Notifikations-e-post (för beställningar)</label>
              <input
                className="input-field"
                value={content.notificationEmails || ''}
                onChange={(e) => set(['notificationEmails'], e.target.value)}
                placeholder="admin@example.se, medarbetare@example.se"
              />
              <p className="text-xs text-stone-400 mt-1">
                Separera flera adresser med komma. Hit skickas ordernotifikationer. Om tomt används kontakt-e-posten ovan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Telefonnummer</label>
                <input
                  className="input-field"
                  value={content.contactPhone || ''}
                  onChange={(e) => set(['contactPhone'], e.target.value)}
                  placeholder="+46 70 123 45 67"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Adress (svenska)</label>
                <input
                  className="input-field"
                  value={content.contactAddress?.sv || ''}
                  onChange={(e) => set(['contactAddress', 'sv'], e.target.value)}
                  placeholder="Göteborg, Sverige"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Adress (engelska)</label>
                <input
                  className="input-field"
                  value={content.contactAddress?.en || ''}
                  onChange={(e) => set(['contactAddress', 'en'], e.target.value)}
                  placeholder="Gothenburg, Sweden"
                />
              </div>
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

        {/* Stripe Payment Links info */}
        <section className="bg-white rounded-lg border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-2">Stripe-betalning</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-semibold mb-1">Så här aktiverar du Stripe-betalning:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Skapa ett konto på <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline">Stripe</a> (gratis)</li>
              <li>Gå till <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noopener noreferrer" className="underline">Payment Links</a> i Stripe Dashboard</li>
              <li>Skapa en Payment Link per konstverk (ange pris i SEK, lägg till bild)</li>
              <li>Kopiera Payment Link-URL:en (börjar med https://buy.stripe.com/...)</li>
              <li>Gå till <strong>Produkter</strong> i admin-panelen och klistra in URL:en i fältet &quot;Stripe Payment Link&quot;</li>
              <li>Kunder kan nu betala direkt via Stripe!</li>
            </ol>
          </div>
          <p className="text-xs text-stone-400 mt-3">
            Stripe hanterar betalning, kvitton och frakt-adress. Pengarna sätts in på ditt bankkonto automatiskt.
            Ingen programmeringskunskap krävs.
          </p>
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-500">
              <strong>Tips:</strong> Aktivera &quot;Collect shipping addresses&quot; och &quot;Collect phone numbers&quot; på dina Payment Links i Stripe Dashboard
              så att leveransinformation samlas in direkt av Stripe. All kundinformation syns sedan under Betalningar i Stripe.
            </p>
          </div>
        </section>

        {/* Purchase terms */}
        <section className="bg-white rounded-lg border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-2">Köpvillkor</h2>
          <p className="text-sm text-stone-500 mb-4">
            Dessa visas på sidan /terms och länkas i footern och varukorgen.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Köpvillkor (svenska)</label>
              <textarea
                className="input-field"
                rows={10}
                value={content.purchaseTerms?.sv || ''}
                onChange={(e) => set(['purchaseTerms', 'sv'], e.target.value)}
                placeholder="Skriv köpvillkor på svenska..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Köpvillkor (engelska)</label>
              <textarea
                className="input-field"
                rows={10}
                value={content.purchaseTerms?.en || ''}
                onChange={(e) => set(['purchaseTerms', 'en'], e.target.value)}
                placeholder="Write purchase terms in English..."
              />
            </div>
          </div>
        </section>

        {/* Selected artworks */}
        <section className="bg-white rounded-lg border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-1">Utvalda verk (startsidan)</h2>
          <p className="text-sm text-stone-500 mb-4">
            Välj upp till {MAX_SELECTED} verk som visas på startsidan. Ordningen bestämmer visningsordningen.
          </p>

          {/* Currently selected — sortable strip */}
          {selected.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Valda ({selected.length}/{MAX_SELECTED})
              </label>
              <div className="flex flex-wrap gap-3">
                {selected.map((pid, idx) => {
                  const p = allProducts.find((pr) => pr.id === pid);
                  if (!p) return null;
                  const imgSrc = p.imageUrl.startsWith('http') ? p.imageUrl : publicUrl(p.imageUrl);
                  return (
                    <div key={pid} className="relative group w-24">
                      <div className="w-24 h-24 rounded border border-stone-200 overflow-hidden relative">
                        <Image src={imgSrc} alt={p.title.sv} fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                      </div>
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removeSelected(pid)}
                          className="bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                        >
                          x
                        </button>
                      </div>
                      <div className="flex justify-center gap-1 mt-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSelected(pid, -1)}
                          className="text-xs text-stone-500 hover:text-stone-800 disabled:opacity-30"
                        >
                          &larr;
                        </button>
                        <span className="text-xs text-stone-400">{idx + 1}</span>
                        <button
                          type="button"
                          disabled={idx === selected.length - 1}
                          onClick={() => moveSelected(pid, 1)}
                          className="text-xs text-stone-500 hover:text-stone-800 disabled:opacity-30"
                        >
                          &rarr;
                        </button>
                      </div>
                      <p className="text-xs text-stone-600 text-center truncate mt-0.5">{p.title.sv}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All products picker */}
          <label className="block text-sm font-medium text-stone-700 mb-2">Alla verk</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {allProducts.map((p) => {
              const isSelected = selected.includes(p.id);
              const imgSrc = p.imageUrl.startsWith('http') ? p.imageUrl : publicUrl(p.imageUrl);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  disabled={!isSelected && selected.length >= MAX_SELECTED}
                  className={`relative rounded border-2 overflow-hidden transition-all ${
                    isSelected
                      ? 'border-amber-600 ring-2 ring-amber-300'
                      : 'border-stone-200 hover:border-stone-400 disabled:opacity-40'
                  }`}
                >
                  <div className="aspect-square relative">
                    <Image src={imgSrc} alt={p.title.sv} fill className="object-cover" unoptimized />
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-amber-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {selected.indexOf(p.id) + 1}
                    </div>
                  )}
                  <p className="text-xs text-stone-700 p-1 truncate">{p.title.sv}</p>
                </button>
              );
            })}
            {allProducts.length === 0 && (
              <p className="col-span-full text-sm text-stone-400">Inga produkter hittades.</p>
            )}
          </div>
        </section>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        {saveSuccess && <p className="text-sm text-green-600">Sparad! Webbplatsen bygger om inom 1-2 minuter.</p>}

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Sparar till GitHub...' : 'Spara innehåll'}
        </button>
      </form>
    </div>
  );
}

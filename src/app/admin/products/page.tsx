'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/types';

type ProductFormData = {
  titleSv: string;
  titleEn: string;
  descSv: string;
  descEn: string;
  price: string;
  currency: string;
  category: string;
  dimensions: string;
  techniqueSv: string;
  techniqueEn: string;
  imageUrl: string;
  status: 'available' | 'sold' | 'reserved';
  productType: 'physical' | 'digital';
};

const emptyForm: ProductFormData = {
  titleSv: '', titleEn: '', descSv: '', descEn: '',
  price: '', currency: 'SEK', category: '', dimensions: '',
  techniqueSv: '', techniqueEn: '', imageUrl: '/images/placeholder.svg',
  status: 'available', productType: 'physical',
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch('/api/admin/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([p, c]) => {
      setProducts(p);
      setCategories(c);
    }).catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({
      titleSv: p.title.sv, titleEn: p.title.en,
      descSv: p.description.sv, descEn: p.description.en,
      price: String(p.price), currency: p.currency,
      category: p.category, dimensions: p.dimensions,
      techniqueSv: p.technique.sv, techniqueEn: p.technique.en,
      imageUrl: p.imageUrl, status: p.status, productType: p.productType,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna produkt?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      title: { sv: form.titleSv, en: form.titleEn },
      description: { sv: form.descSv, en: form.descEn },
      price: Number(form.price),
      currency: form.currency,
      category: form.category,
      dimensions: form.dimensions,
      technique: { sv: form.techniqueSv, en: form.techniqueEn },
      imageUrl: form.imageUrl,
      status: form.status,
      productType: form.productType,
    };
    if (editingId) {
      await fetch(`/api/admin/products/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const f = (key: keyof ProductFormData, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  if (loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-stone-800">Produkter</h1>
        <button onClick={openAdd} className="btn-primary text-sm">+ Lägg till produkt</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto p-6">
            <h2 className="font-serif text-xl mb-4">{editingId ? 'Redigera produkt' : 'Ny produkt'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Titel (SV)</label>
                  <input className="input-field" value={form.titleSv} onChange={(e) => f('titleSv', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Titel (EN)</label>
                  <input className="input-field" value={form.titleEn} onChange={(e) => f('titleEn', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Beskrivning (SV)</label>
                  <textarea className="input-field" rows={3} value={form.descSv} onChange={(e) => f('descSv', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Beskrivning (EN)</label>
                  <textarea className="input-field" rows={3} value={form.descEn} onChange={(e) => f('descEn', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Pris (SEK)</label>
                  <input type="number" className="input-field" value={form.price} onChange={(e) => f('price', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
                  <select className="input-field" value={form.category} onChange={(e) => f('category', e.target.value)} required>
                    <option value="">Välj...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name.sv}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Mått</label>
                  <input className="input-field" value={form.dimensions} onChange={(e) => f('dimensions', e.target.value)} placeholder="60x80 cm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Teknik (SV)</label>
                  <input className="input-field" value={form.techniqueSv} onChange={(e) => f('techniqueSv', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Teknik (EN)</label>
                  <input className="input-field" value={form.techniqueEn} onChange={(e) => f('techniqueEn', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Bild-URL</label>
                <input className="input-field" value={form.imageUrl} onChange={(e) => f('imageUrl', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => f('status', e.target.value as ProductFormData['status'])}>
                    <option value="available">Tillgänglig</option>
                    <option value="sold">Såld</option>
                    <option value="reserved">Reserverad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Typ</label>
                  <select className="input-field" value={form.productType} onChange={(e) => f('productType', e.target.value as ProductFormData['productType'])}>
                    <option value="physical">Fysisk</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Sparar...' : 'Spara'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Avbryt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left px-4 py-3 font-medium text-stone-600">Titel</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Pris</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-stone-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-800">{p.title.sv}</td>
                <td className="px-4 py-3 text-stone-600">{p.category}</td>
                <td className="px-4 py-3 text-stone-600">{p.price.toLocaleString('sv-SE')} SEK</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'available' ? 'bg-green-100 text-green-800' :
                    p.status === 'sold' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="text-amber-700 hover:text-amber-900 mr-3">Redigera</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">Ta bort</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-stone-400">Inga produkter</p>}
      </div>
    </div>
  );
}

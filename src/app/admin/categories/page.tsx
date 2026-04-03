'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', nameSv: '', nameEn: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    fetch('/api/admin/categories')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setCategories(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => { setForm({ id: '', nameSv: '', nameEn: '' }); setEditingId(null); setShowForm(true); };
  const openEdit = (c: Category) => {
    setForm({ id: c.id, nameSv: c.name.sv, nameEn: c.name.en });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ta bort denna kategori?')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { id: form.id, name: { sv: form.nameSv, en: form.nameEn } };
    if (editingId) {
      await fetch(`/api/admin/categories/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  if (loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-stone-800">Kategorier</h1>
        <button onClick={openAdd} className="btn-primary text-sm">+ Lägg till kategori</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="font-serif text-xl mb-4">{editingId ? 'Redigera kategori' : 'Ny kategori'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">ID (slug)</label>
                  <input className="input-field" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="t.ex. oil" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Namn (SV)</label>
                <input className="input-field" value={form.nameSv} onChange={(e) => setForm({ ...form, nameSv: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Namn (EN)</label>
                <input className="input-field" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
              </div>
              <div className="flex gap-3">
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
              <th className="text-left px-4 py-3 font-medium text-stone-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Namn (SV)</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Namn (EN)</th>
              <th className="text-right px-4 py-3 font-medium text-stone-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-500 font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3 text-stone-800">{c.name.sv}</td>
                <td className="px-4 py-3 text-stone-800">{c.name.en}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-amber-700 hover:text-amber-900 mr-3">Redigera</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800">Ta bort</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="p-8 text-center text-stone-400">Inga kategorier</p>}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Craft } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile, writeJsonFile } from '@/lib/github';

export default function AdminCraftCategoriesPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', nameSv: '', nameEn: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchData = async (t: string) => {
    const [cat, c] = await Promise.all([
      readJsonFile<Category[]>(t, 'data/craft-categories.json'),
      readJsonFile<Craft[]>(t, 'data/crafts.json'),
    ]);
    setCategories(cat.data);
    setCrafts(c.data);
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }
    fetchData(token).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, token, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => { setForm({ id: '', nameSv: '', nameEn: '' }); setEditingId(null); setShowForm(true); setSaveError(''); };
  const openEdit = (c: Category) => {
    setForm({ id: c.id, nameSv: c.name.sv, nameEn: c.name.en });
    setEditingId(c.id);
    setShowForm(true);
    setSaveError('');
  };

  const countFor = (categoryId: string) => crafts.filter((c) => c.category === categoryId).length;

  const handleDelete = async (id: string) => {
    if (!token) return;
    const inUse = countFor(id);
    if (inUse > 0) {
      alert(`Kategorin används av ${inUse} hantverk. Flytta dem till en annan kategori först.`);
      return;
    }
    if (!confirm('Ta bort denna hantverkskategori?')) return;
    setSaving(true);
    try {
      const { data, sha } = await readJsonFile<Category[]>(token, 'data/craft-categories.json');
      const updated = data.filter((c) => c.id !== id);
      await writeJsonFile(token, 'data/craft-categories.json', updated, sha, `Admin: ta bort hantverkskategori ${id}`);
      setCategories(updated);
    } catch (err) {
      alert('Kunde inte ta bort kategori: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSaveError('');
    try {
      const { data, sha } = await readJsonFile<Category[]>(token, 'data/craft-categories.json');
      let updated: Category[];

      if (editingId) {
        updated = data.map((c) =>
          c.id === editingId ? { ...c, name: { sv: form.nameSv, en: form.nameEn } } : c,
        );
        await writeJsonFile(token, 'data/craft-categories.json', updated, sha, `Admin: uppdatera hantverkskategori ${editingId}`);
      } else {
        if (data.some((c) => c.id === form.id)) {
          setSaveError(`ID:t "${form.id}" används redan.`);
          setSaving(false);
          return;
        }
        const newCat: Category = { id: form.id, name: { sv: form.nameSv, en: form.nameEn } };
        updated = [...data, newCat];
        await writeJsonFile(token, 'data/craft-categories.json', updated, sha, `Admin: lägg till hantverkskategori ${newCat.id}`);
      }

      setCategories(updated);
      setShowForm(false);
    } catch (err) {
      setSaveError('Sparning misslyckades: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-stone-800">Hantverkskategorier</h1>
        <button onClick={openAdd} className="btn-primary text-sm">+ Lägg till kategori</button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
        Dessa kategorier används bara på <span className="font-mono">/crafts</span> — separat från kategorierna i butiken.
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="font-serif text-xl mb-4">{editingId ? 'Redigera kategori' : 'Ny kategori'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">ID (slug)</label>
                  <input className="input-field" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="t.ex. masks" required />
                  <p className="text-xs text-stone-400 mt-1">Används som nyckel i databasen. ID:t kan inte ändras efter att kategorin skapats.</p>
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
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Sparar till GitHub...' : 'Spara'}
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
              <th className="text-left px-4 py-3 font-medium text-stone-600">Antal</th>
              <th className="text-right px-4 py-3 font-medium text-stone-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-500 font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3 text-stone-800">{c.name.sv}</td>
                <td className="px-4 py-3 text-stone-800">{c.name.en}</td>
                <td className="px-4 py-3 text-stone-600">{countFor(c.id)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-amber-700 hover:text-amber-900 mr-3">Redigera</button>
                  <button onClick={() => handleDelete(c.id)} disabled={saving} className="text-red-600 hover:text-red-800 disabled:opacity-50">Ta bort</button>
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

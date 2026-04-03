'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Exhibition, ExhibitionStatus } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile, writeJsonFile } from '@/lib/github';

type ExhibitionFormData = {
  titleSv: string;
  titleEn: string;
  descSv: string;
  descEn: string;
  locationSv: string;
  locationEn: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  status: ExhibitionStatus;
};

const emptyForm: ExhibitionFormData = {
  titleSv: '', titleEn: '', descSv: '', descEn: '',
  locationSv: '', locationEn: '',
  startDate: '', endDate: '',
  imageUrl: '', status: 'upcoming',
};

export default function AdminExhibitionsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAdmin();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExhibitionFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }
    readJsonFile<Exhibition[]>(token, 'data/exhibitions.json')
      .then(({ data }) => setExhibitions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, token, router]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); setSaveError(''); };
  const openEdit = (ex: Exhibition) => {
    setForm({
      titleSv: ex.title.sv, titleEn: ex.title.en,
      descSv: ex.description.sv, descEn: ex.description.en,
      locationSv: ex.location.sv, locationEn: ex.location.en,
      startDate: ex.startDate, endDate: ex.endDate,
      imageUrl: ex.imageUrl, status: ex.status,
    });
    setEditingId(ex.id);
    setShowForm(true);
    setSaveError('');
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Är du säker på att du vill ta bort denna utställning?')) return;
    setSaving(true);
    try {
      const { data, sha } = await readJsonFile<Exhibition[]>(token, 'data/exhibitions.json');
      const updated = data.filter((ex) => ex.id !== id);
      await writeJsonFile(token, 'data/exhibitions.json', updated, sha, `Admin: ta bort utställning ${id}`);
      setExhibitions(updated);
    } catch (err) {
      alert('Kunde inte ta bort utställning: ' + String(err));
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
      const { data, sha } = await readJsonFile<Exhibition[]>(token, 'data/exhibitions.json');
      let updated: Exhibition[];

      if (editingId) {
        updated = data.map((ex) =>
          ex.id === editingId
            ? {
                ...ex,
                title: { sv: form.titleSv, en: form.titleEn },
                description: { sv: form.descSv, en: form.descEn },
                location: { sv: form.locationSv, en: form.locationEn },
                startDate: form.startDate,
                endDate: form.endDate,
                imageUrl: form.imageUrl,
                status: form.status,
              }
            : ex,
        );
        await writeJsonFile(token, 'data/exhibitions.json', updated, sha, `Admin: uppdatera utställning ${editingId}`);
      } else {
        const newEx: Exhibition = {
          id: uuidv4(),
          title: { sv: form.titleSv, en: form.titleEn },
          description: { sv: form.descSv, en: form.descEn },
          location: { sv: form.locationSv, en: form.locationEn },
          startDate: form.startDate,
          endDate: form.endDate,
          imageUrl: form.imageUrl,
          status: form.status,
          createdAt: new Date().toISOString(),
        };
        updated = [...data, newEx];
        await writeJsonFile(token, 'data/exhibitions.json', updated, sha, `Admin: lägg till utställning ${newEx.id}`);
      }

      setExhibitions(updated);
      setShowForm(false);
    } catch (err) {
      setSaveError('Sparning misslyckades: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const f = (key: keyof ExhibitionFormData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const statusLabel = (s: ExhibitionStatus) =>
    s === 'upcoming' ? 'Kommande' : s === 'active' ? 'Pågående' : 'Tidigare';

  if (isLoading || loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-stone-800">Utställningar</h1>
        <button onClick={openAdd} className="btn-primary text-sm">+ Lägg till utställning</button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
        Ändringar syns på webbplatsen efter nästa bygge (vanligtvis 1–2 minuter).
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto p-6">
            <h2 className="font-serif text-xl mb-4">{editingId ? 'Redigera utställning' : 'Ny utställning'}</h2>
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
                  <textarea className="input-field" rows={3} value={form.descSv} onChange={(e) => f('descSv', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Beskrivning (EN)</label>
                  <textarea className="input-field" rows={3} value={form.descEn} onChange={(e) => f('descEn', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Plats (SV)</label>
                  <input className="input-field" value={form.locationSv} onChange={(e) => f('locationSv', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Plats (EN)</label>
                  <input className="input-field" value={form.locationEn} onChange={(e) => f('locationEn', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Startdatum</label>
                  <input type="date" className="input-field" value={form.startDate} onChange={(e) => f('startDate', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Slutdatum</label>
                  <input type="date" className="input-field" value={form.endDate} onChange={(e) => f('endDate', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Bild-URL</label>
                <input className="input-field" value={form.imageUrl} onChange={(e) => f('imageUrl', e.target.value)} placeholder="/images/exhibitions/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                <select className="input-field" value={form.status} onChange={(e) => f('status', e.target.value as ExhibitionStatus)}>
                  <option value="upcoming">Kommande</option>
                  <option value="active">Pågående</option>
                  <option value="past">Tidigare</option>
                </select>
              </div>
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <div className="flex gap-3 pt-2">
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
              <th className="text-left px-4 py-3 font-medium text-stone-600">Titel</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Plats</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-stone-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {exhibitions.map((ex) => (
              <tr key={ex.id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-800">{ex.title.sv}</td>
                <td className="px-4 py-3 text-stone-600">{ex.location.sv}</td>
                <td className="px-4 py-3 text-stone-600">{ex.startDate} – {ex.endDate}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ex.status === 'active' ? 'bg-green-100 text-green-800' :
                    ex.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-stone-100 text-stone-600'
                  }`}>{statusLabel(ex.status)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(ex)} className="text-amber-700 hover:text-amber-900 mr-3">Redigera</button>
                  <button onClick={() => handleDelete(ex.id)} disabled={saving} className="text-red-600 hover:text-red-800 disabled:opacity-50">Ta bort</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {exhibitions.length === 0 && <p className="p-8 text-center text-stone-400">Inga utställningar</p>}
      </div>
    </div>
  );
}

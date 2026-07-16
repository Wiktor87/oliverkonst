'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Craft, Category } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile, writeJsonFile, uploadFile } from '@/lib/github';
import { publicUrl } from '@/lib/config';

type CraftFormData = {
  titleSv: string;
  titleEn: string;
  descSv: string;
  descEn: string;
  category: string;
  materialsSv: string;
  materialsEn: string;
  year: string;
  dimensions: string;
  madeFor: string;
  imageUrl: string;
  images: string[];
};

/** Map from repo path (/images/crafts/...) to local blob URL for preview */
type BlobPreviewMap = Record<string, string>;

const emptyForm: CraftFormData = {
  titleSv: '', titleEn: '', descSv: '', descEn: '',
  category: '', materialsSv: '', materialsEn: '',
  year: '', dimensions: '', madeFor: '',
  imageUrl: '/images/placeholder.svg', images: [],
};

/** Convert a title to a URL-safe slug */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Make a slug unique against existing ids by appending -2, -3, ... */
function uniqueSlug(base: string, taken: string[]): string {
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Read a File as base64 (strips the data-URL prefix) */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminCraftsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAdmin();
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CraftFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [blobPreviews, setBlobPreviews] = useState<BlobPreviewMap>({});

  const fetchData = async (t: string) => {
    const [c, cat] = await Promise.all([
      readJsonFile<Craft[]>(t, 'data/crafts.json'),
      readJsonFile<Category[]>(t, 'data/craft-categories.json'),
    ]);
    setCrafts(c.data);
    setCategories(cat.data);
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }
    fetchData(token).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, token, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setSaveError('');
    setBlobPreviews({});
  };

  const openEdit = (c: Craft) => {
    const imgs = c.images && c.images.length > 0 ? c.images : (c.imageUrl ? [c.imageUrl] : []);
    setForm({
      titleSv: c.title.sv, titleEn: c.title.en,
      descSv: c.description.sv, descEn: c.description.en,
      category: c.category,
      materialsSv: c.materials.sv, materialsEn: c.materials.en,
      year: c.year || '', dimensions: c.dimensions || '', madeFor: c.madeFor || '',
      imageUrl: c.imageUrl, images: imgs,
    });
    setEditingId(c.id);
    setShowForm(true);
    setSaveError('');
    setBlobPreviews({});
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Är du säker på att du vill ta bort detta hantverk?')) return;
    setSaving(true);
    try {
      const { data, sha } = await readJsonFile<Craft[]>(token, 'data/crafts.json');
      const updated = data.filter((c) => c.id !== id);
      await writeJsonFile(token, 'data/crafts.json', updated, sha, `Admin: ta bort hantverk ${id}`);
      setCrafts(updated);
    } catch (err) {
      alert('Kunde inte ta bort hantverk: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!token || files.length === 0) return;
    const slug = toSlug(form.titleSv || form.titleEn || '');
    if (!slug) {
      alert('Ange hantverkets titel (svenska) innan du laddar upp bilder.');
      return;
    }
    setUploadingImages(true);
    const newPaths: string[] = [];
    const newBlobPreviews: BlobPreviewMap = {};
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `${Date.now()}-${i + 1}.${ext}`;
        const filePath = `public/images/crafts/${slug}/${filename}`;
        const publicPath = `/images/crafts/${slug}/${filename}`;
        setUploadProgress(`Laddar upp ${i + 1}/${files.length}: ${filename}`);
        const base64 = await readFileAsBase64(file);
        await uploadFile(token, filePath, base64, `Admin: lägg till hantverksbild ${publicPath}`);
        // Blob URL for immediate preview (the repo path 404s until the site is deployed)
        newBlobPreviews[publicPath] = URL.createObjectURL(file);
        newPaths.push(publicPath);
      }
      setBlobPreviews((prev) => ({ ...prev, ...newBlobPreviews }));
      const combined = [...form.images, ...newPaths];
      setForm((prev) => ({
        ...prev,
        images: combined,
        imageUrl: combined[0] || prev.imageUrl,
      }));
    } catch (err) {
      alert('Uppladdning misslyckades: ' + String(err));
    } finally {
      setUploadingImages(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const imgs = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: imgs, imageUrl: imgs[0] || '/images/placeholder.svg' };
    });
  };

  const moveImage = (from: number, to: number) => {
    setForm((prev) => {
      const imgs = [...prev.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...prev, images: imgs, imageUrl: imgs[0] || prev.imageUrl };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSaveError('');

    const now = new Date().toISOString();
    const finalImages = form.images.length > 0 ? form.images : (form.imageUrl ? [form.imageUrl] : []);
    const finalImageUrl = finalImages[0] || form.imageUrl;

    try {
      const { data, sha } = await readJsonFile<Craft[]>(token, 'data/crafts.json');
      let updated: Craft[];

      const fields = {
        title: { sv: form.titleSv, en: form.titleEn },
        description: { sv: form.descSv, en: form.descEn },
        category: form.category,
        materials: { sv: form.materialsSv, en: form.materialsEn },
        year: form.year || undefined,
        dimensions: form.dimensions || undefined,
        madeFor: form.madeFor || undefined,
        imageUrl: finalImageUrl,
        images: finalImages,
      };

      if (editingId) {
        updated = data.map((c) =>
          c.id === editingId ? { ...c, ...fields, updatedAt: now } : c,
        );
        await writeJsonFile(token, 'data/crafts.json', updated, sha, `Admin: uppdatera hantverk ${editingId}`);
      } else {
        const slug = uniqueSlug(toSlug(form.titleSv), data.map((c) => c.id));
        if (!slug) {
          setSaveError('Titeln (svenska) måste innehålla bokstäver eller siffror.');
          setSaving(false);
          return;
        }
        const newCraft: Craft = { id: slug, ...fields, createdAt: now, updatedAt: now };
        updated = [...data, newCraft];
        await writeJsonFile(token, 'data/crafts.json', updated, sha, `Admin: lägg till hantverk ${newCraft.id}`);
      }

      setCrafts(updated);
      setShowForm(false);
    } catch (err) {
      setSaveError('Sparning misslyckades: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const f = (key: keyof CraftFormData, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const resolveImg = (url: string) => {
    if (blobPreviews[url]) return blobPreviews[url];
    return url.startsWith('http') ? url : publicUrl(url);
  };

  if (isLoading || loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-stone-800">Hantverk</h1>
        <button onClick={openAdd} className="btn-primary text-sm">+ Lägg till hantverk</button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
        Hantverk visas på <span className="font-mono">/crafts</span> som portfolio — utan pris och köpknapp.
        Ändringar syns på webbplatsen efter nästa bygge (vanligtvis 1–2 minuter).
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto p-6">
            <h2 className="font-serif text-xl mb-4">{editingId ? 'Redigera hantverk' : 'Nytt hantverk'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Titel (SV)</label>
                  <input className="input-field" value={form.titleSv} onChange={(e) => f('titleSv', e.target.value)} required />
                  {!editingId && form.titleSv && (
                    <p className="text-xs text-stone-400 mt-1">
                      Adress: <span className="font-mono">/crafts/{toSlug(form.titleSv)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Titel (EN)</label>
                  <input className="input-field" value={form.titleEn} onChange={(e) => f('titleEn', e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Beskrivning (SV)</label>
                  <textarea className="input-field" rows={4} value={form.descSv} onChange={(e) => f('descSv', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Beskrivning (EN)</label>
                  <textarea className="input-field" rows={4} value={form.descEn} onChange={(e) => f('descEn', e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
                  <select className="input-field" value={form.category} onChange={(e) => f('category', e.target.value)} required>
                    <option value="">Välj...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name.sv}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">År</label>
                  <input className="input-field" value={form.year} onChange={(e) => f('year', e.target.value)} placeholder="2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Mått</label>
                  <input className="input-field" value={form.dimensions} onChange={(e) => f('dimensions', e.target.value)} placeholder="valfritt" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Material (SV)</label>
                  <input className="input-field" value={form.materialsSv} onChange={(e) => f('materialsSv', e.target.value)} placeholder="Vegetabiliskt garvat läder, mässing" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Material (EN)</label>
                  <input className="input-field" value={form.materialsEn} onChange={(e) => f('materialsEn', e.target.value)} placeholder="Veg-tanned leather, brass" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Gjord för</label>
                <input className="input-field" value={form.madeFor} onChange={(e) => f('madeFor', e.target.value)} placeholder="t.ex. lajvgrupp, filmproduktion — valfritt" />
              </div>

              {/* Image management */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Bilder</label>

                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <div className="relative w-20 h-20 rounded border border-stone-200 overflow-hidden">
                          <Image src={resolveImg(img)} alt={`Bild ${i + 1}`} fill className="object-cover" unoptimized />
                          {i === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-amber-600 text-white text-xs text-center py-0.5">
                              Primär
                            </span>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                          {i > 0 && (
                            <button type="button" onClick={() => moveImage(i, i - 1)} title="Flytta vänster" className="text-white text-xs bg-black/50 rounded px-1">←</button>
                          )}
                          {i < form.images.length - 1 && (
                            <button type="button" onClick={() => moveImage(i, i + 1)} title="Flytta höger" className="text-white text-xs bg-black/50 rounded px-1">→</button>
                          )}
                          <button type="button" onClick={() => removeImage(i)} title="Ta bort" className="text-white text-xs bg-red-600/80 rounded px-1">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {form.images.length === 0 && (
                  <div className="mb-2">
                    <input
                      className="input-field"
                      value={form.imageUrl}
                      onChange={(e) => f('imageUrl', e.target.value)}
                      placeholder="/images/crafts/..."
                    />
                  </div>
                )}

                <div className="border-2 border-dashed border-stone-200 rounded-lg p-4">
                  <p className="text-xs text-stone-500 mb-2">
                    Ladda upp bilder direkt till repot (kräver att du fyllt i titeln på svenska).
                    Första bilden blir primärbild.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="text-sm text-stone-600"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    disabled={uploadingImages}
                  />
                  {uploadingImages && (
                    <p className="text-xs text-amber-700 mt-2">{uploadProgress || 'Laddar upp...'}</p>
                  )}
                </div>
              </div>

              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploadingImages} className="btn-primary disabled:opacity-50">
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
              <th className="text-left px-4 py-3 font-medium text-stone-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">År</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Adress</th>
              <th className="text-right px-4 py-3 font-medium text-stone-600">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {crafts.map((c) => (
              <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-800">{c.title.sv}</td>
                <td className="px-4 py-3 text-stone-600">
                  {categories.find((cat) => cat.id === c.category)?.name.sv || c.category}
                </td>
                <td className="px-4 py-3 text-stone-600">{c.year || '—'}</td>
                <td className="px-4 py-3 text-stone-400 font-mono text-xs">/crafts/{c.id}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-amber-700 hover:text-amber-900 mr-3">Redigera</button>
                  <button onClick={() => handleDelete(c.id)} disabled={saving} className="text-red-600 hover:text-red-800 disabled:opacity-50">Ta bort</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {crafts.length === 0 && <p className="p-8 text-center text-stone-400">Inga hantverk</p>}
      </div>
    </div>
  );
}

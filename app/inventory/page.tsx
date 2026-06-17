'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type Item = {
  id: string;
  category: string;
  brand: string;
  product: string;
  shade: string;
  finish: string;
  notes: string;
  favorite: boolean;
};

type IdentifiedProduct = {
  category: string;
  brand: string;
  product: string;
  shade: string;
  finish: string;
};

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ category: 'blush', brand: '', product: '', shade: '', finish: '', notes: '', favorite: false });

  // Photo identification state
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identified, setIdentified] = useState<IdentifiedProduct[]>([]);
  const [savingIdentified, setSavingIdentified] = useState(false);
  const [identifyMessage, setIdentifyMessage] = useState('');

  async function loadItems() {
    const res = await fetch('/api/inventory');
    const data = await res.json();
    if (res.ok) setItems(data.items || []);
  }

  async function addItem() {
    setMessage('');
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to add item'); return; }
    setForm({ category: 'blush', brand: '', product: '', shade: '', finish: '', notes: '', favorite: false });
    setMessage('Item added.');
    loadItems();
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadItems();
  }

  useEffect(() => {
    loadItems();
    return () => { photoPreviews.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setPhotoError(null);
    const oversize = files.find((f) => f.size > MAX_PHOTO_BYTES);
    if (oversize) { setPhotoError('Each photo must be 10MB or smaller.'); return; }
    const merged = [...photos, ...files].slice(0, MAX_PHOTOS);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(merged);
    setPhotoPreviews(merged.map((f) => URL.createObjectURL(f)));
  }

  function removePhoto(idx: number) {
    const next = photos.filter((_, i) => i !== idx);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(next);
    setPhotoPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function identifyProducts() {
    if (photos.length === 0) return;
    setIdentifying(true);
    setIdentifyMessage('');
    setIdentified([]);
    try {
      const base64Photos = await Promise.all(photos.map(fileToBase64));
      const res = await fetch('/api/identify-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: base64Photos }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const products: IdentifiedProduct[] = data.products ?? [];
      if (products.length === 0) {
        setIdentifyMessage("Maya couldn't spot any products — try a closer, clearer photo.");
      } else {
        setIdentified(products);
      }
    } catch {
      setIdentifyMessage('Something went wrong. Please try again.');
    } finally {
      setIdentifying(false);
    }
  }

  function updateIdentified(idx: number, field: keyof IdentifiedProduct, value: string) {
    setIdentified((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  function removeIdentified(idx: number) {
    setIdentified((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveIdentified() {
    if (identified.length === 0) return;
    setSavingIdentified(true);
    setIdentifyMessage('');
    try {
      await Promise.all(
        identified.map((p) =>
          fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...p, notes: '', favorite: false }),
          })
        )
      );
      setIdentified([]);
      setPhotos([]);
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPhotoPreviews([]);
      setIdentifyMessage(`${identified.length} product${identified.length > 1 ? 's' : ''} added to your collection.`);
      loadItems();
    } catch {
      setIdentifyMessage('Could not save — please try again.');
    } finally {
      setSavingIdentified(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 min-h-screen bg-rose-50">

      {/* Header */}
      <h1 className="text-4xl font-semibold tracking-tight">My Collection</h1>
      <p className="mt-3 text-sm leading-7 text-neutral-600 max-w-xl">
        The more Maya knows about what&apos;s already in your collection, the better she can help you use it — guiding you toward what you own instead of what to buy next. Snap a few photos below and she&apos;ll help you build it out.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* Left column: photo ID + manual add */}
        <div className="flex flex-col gap-6">

          {/* Add by photo */}
          <section className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Add by photo</h2>
            <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
              Photograph your products and Maya will read the packaging for you.
            </p>

            {/* Photo grid */}
            {photoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {photoPreviews.map((src, i) => (
                  <div key={src} className="relative rounded-xl overflow-hidden aspect-square bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="product photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label="Remove photo"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 border border-neutral-200 text-xs text-neutral-700 flex items-center justify-center hover:bg-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload controls */}
            <div className="mt-4 flex gap-3">
              <label className="flex-1 flex flex-col items-center justify-center gap-1.5 border border-neutral-200 rounded-xl py-4 bg-neutral-50 cursor-pointer hover:border-brand transition-colors">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={photos.length >= MAX_PHOTOS} />
                <span className="text-xl">📷</span>
                <span className="text-xs font-medium text-neutral-600">Camera</span>
              </label>
              <label className="flex-1 flex flex-col items-center justify-center gap-1.5 border border-neutral-200 rounded-xl py-4 bg-neutral-50 cursor-pointer hover:border-brand transition-colors">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={photos.length >= MAX_PHOTOS} />
                <span className="text-xl">🖼</span>
                <span className="text-xs font-medium text-neutral-600">Upload</span>
              </label>
            </div>

            {photos.length > 0 && photos.length < MAX_PHOTOS && (
              <p className="mt-2 text-xs text-neutral-400 text-center">{MAX_PHOTOS - photos.length} more photo{MAX_PHOTOS - photos.length !== 1 ? 's' : ''} allowed</p>
            )}

            {photoError && <p className="mt-2 text-xs text-red-500">{photoError}</p>}

            {photos.length > 0 && identified.length === 0 && (
              <button
                type="button"
                onClick={identifyProducts}
                disabled={identifying}
                className={`mt-4 w-full rounded-2xl bg-brand px-5 py-3 text-white text-sm font-semibold hover:bg-[#C08878] transition-colors disabled:opacity-50 ${identifying ? 'animate-pulse' : ''}`}
              >
                {identifying ? 'Looking at what you\'ve got…' : 'Identify products'}
              </button>
            )}

            <p className="mt-3 text-xs text-neutral-400 text-center leading-relaxed">
              🔒 Photos are used only to identify your products and are not stored.
            </p>

            {identifyMessage && (
              <p className="mt-3 text-sm text-neutral-600 text-center">{identifyMessage}</p>
            )}
          </section>

          {/* Manual add */}
          <section className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Add manually</h2>
            <div className="mt-4 grid gap-3">
              <input className="rounded-2xl border p-3" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="rounded-2xl border p-3" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              <input className="rounded-2xl border p-3" placeholder="Product" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
              <input className="rounded-2xl border p-3" placeholder="Shade" value={form.shade} onChange={(e) => setForm({ ...form, shade: e.target.value })} />
              <input className="rounded-2xl border p-3" placeholder="Finish" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
              <textarea className="min-h-[80px] rounded-2xl border p-3" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" checked={form.favorite} onChange={(e) => setForm({ ...form, favorite: e.target.checked })} />
                Mark as favorite
              </label>
              <button onClick={addItem} className="rounded-2xl bg-brand px-5 py-3 text-white hover:bg-[#C08878] transition-colors text-sm font-semibold">Add item</button>
              {message && <p className="text-sm text-neutral-600">{message}</p>}
            </div>
          </section>
        </div>

        {/* Right column: review cards + library */}
        <div className="flex flex-col gap-6">

          {/* Identified product review cards */}
          {identified.length > 0 && (
            <section className="rounded-3xl border border-brand/30 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold">Review before adding</h2>
              <p className="mt-1 text-sm text-neutral-500">Edit anything that looks off, then add them all at once.</p>
              <div className="mt-5 flex flex-col gap-4">
                {identified.map((p, i) => (
                  <div key={i} className="rounded-2xl border border-neutral-200 p-4 relative">
                    <button
                      type="button"
                      onClick={() => removeIdentified(i)}
                      aria-label="Remove"
                      className="absolute top-3 right-3 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      ✕
                    </button>
                    <div className="grid gap-2 pr-6">
                      <input
                        className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                        placeholder="Category"
                        value={p.category}
                        onChange={(e) => updateIdentified(i, 'category', e.target.value)}
                      />
                      <input
                        className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                        placeholder="Brand"
                        value={p.brand}
                        onChange={(e) => updateIdentified(i, 'brand', e.target.value)}
                      />
                      <input
                        className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                        placeholder="Product"
                        value={p.product}
                        onChange={(e) => updateIdentified(i, 'product', e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                          placeholder="Shade"
                          value={p.shade}
                          onChange={(e) => updateIdentified(i, 'shade', e.target.value)}
                        />
                        <input
                          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                          placeholder="Finish"
                          value={p.finish}
                          onChange={(e) => updateIdentified(i, 'finish', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={saveIdentified}
                disabled={savingIdentified || identified.length === 0}
                className="mt-5 w-full rounded-2xl bg-brand px-5 py-3 text-white text-sm font-semibold hover:bg-[#C08878] transition-colors disabled:opacity-50"
              >
                {savingIdentified ? 'Saving…' : `Add ${identified.length} product${identified.length !== 1 ? 's' : ''} to My Collection`}
              </button>
            </section>
          )}

          {/* Library */}
          <section className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Your collection</h2>
            <div className="mt-4 grid gap-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.brand} {item.product}</p>
                      <p className="mt-1 text-sm text-neutral-500">{item.category}{item.shade ? ` · ${item.shade}` : ''}{item.favorite ? ' · favorite' : ''}</p>
                      {item.finish && <p className="mt-0.5 text-sm text-neutral-500">Finish: {item.finish}</p>}
                      {item.notes && <p className="mt-2 text-sm text-neutral-700">{item.notes}</p>}
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors underline shrink-0">Delete</button>
                  </div>
                </article>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-neutral-500">Nothing here yet. When you notice something — a blush that turns, a look that felt off — bring it here.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

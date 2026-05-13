'use client';

import { useEffect, useState } from 'react';

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

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ category: 'blush', brand: '', product: '', shade: '', finish: '', notes: '', favorite: false });

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

  useEffect(() => { loadItems(); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Inventory</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Add product</h2>
          <div className="mt-4 grid gap-3">
            <input className="rounded-2xl border p-3" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="rounded-2xl border p-3" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <input className="rounded-2xl border p-3" placeholder="Product" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
            <input className="rounded-2xl border p-3" placeholder="Shade" value={form.shade} onChange={(e) => setForm({ ...form, shade: e.target.value })} />
            <input className="rounded-2xl border p-3" placeholder="Finish" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
            <textarea className="min-h-[120px] rounded-2xl border p-3" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={form.favorite} onChange={(e) => setForm({ ...form, favorite: e.target.checked })} />
              Mark as favorite
            </label>
            <button onClick={addItem} className="rounded-2xl bg-brand px-5 py-3 text-white hover:bg-[#C08878] transition-colors">Add item</button>
            {message && <p className="text-sm text-neutral-600">{message}</p>}
          </div>
        </section>
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Your library</h2>
          <div className="mt-4 grid gap-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.brand} {item.product}</p>
                    <p className="mt-1 text-sm text-neutral-600">{item.category} · {item.shade} {item.favorite ? '· favorite' : ''}</p>
                    {item.finish && <p className="mt-1 text-sm text-neutral-600">Finish: {item.finish}</p>}
                    {item.notes && <p className="mt-2 text-sm">{item.notes}</p>}
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="text-sm underline">Delete</button>
                </div>
              </article>
            ))}
            {items.length === 0 && <p className="text-sm text-neutral-600">No inventory items yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
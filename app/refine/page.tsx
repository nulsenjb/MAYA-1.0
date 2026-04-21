'use client';

import { useEffect, useState } from 'react';

type Note = { id: string; note_date: string; title: string; note: string; outcome: string; };

export default function RefinePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ note_date: new Date().toISOString().slice(0, 10), title: '', note: '', outcome: 'good' });

  async function loadNotes() {
    const res = await fetch('/api/notes');
    const data = await res.json();
    if (res.ok) setNotes(data.notes || []);
  }

  async function addNote() {
    setMessage('');
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to save note'); return; }
    setForm({ note_date: new Date().toISOString().slice(0, 10), title: '', note: '', outcome: 'good' });
    setMessage('Refinement note saved.');
    loadNotes();
  }

  useEffect(() => { loadNotes(); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Refine Style</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">New refinement note</h2>
          <div className="mt-4 grid gap-3">
            <input className="rounded-2xl border p-3" type="date" value={form.note_date} onChange={(e) => setForm({ ...form, note_date: e.target.value })} />
            <input className="rounded-2xl border p-3" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="rounded-2xl border p-3" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })}>
              <option value="love">love</option>
              <option value="good">good</option>
              <option value="mixed">mixed</option>
              <option value="fail">fail</option>
            </select>
            <textarea className="min-h-[140px] rounded-2xl border p-3" placeholder="What worked, what failed, what changed the result" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <button className="rounded-2xl bg-black px-5 py-3 text-white" onClick={addNote}>Save note</button>
            {message && <p className="text-sm text-neutral-600">{message}</p>}
          </div>
        </section>
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">History</h2>
          <div className="mt-4 grid gap-3">
            {notes.map((note) => (
              <article key={note.id} className="rounded-2xl border p-4">
                <p className="font-medium">{note.title}</p>
                <p className="mt-1 text-sm text-neutral-600">{note.note_date} · {note.outcome}</p>
                <p className="mt-2 text-sm">{note.note}</p>
              </article>
            ))}
            {notes.length === 0 && <p className="text-sm text-neutral-600">No refinement notes yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
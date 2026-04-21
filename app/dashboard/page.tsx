'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Look = {
  id: string;
  title: string;
  occasion: string;
  steps: string[];
  palette: string[];
  notes: string;
  created_at: string;
};

const PALETTE_PRESETS: Record<string, string[]> = {
  'day': ['#F5E6D3', '#E8C5A0', '#D4956A', '#C17A4A', '#8B5A2B'],
  'evening': ['#2C1810', '#8B3A3A', '#C4614A', '#E8956A', '#F5C49A'],
  'office': ['#E8E0D5', '#C4B5A0', '#8B7355', '#5C4A32', '#3D3020'],
  'casual': ['#E8F0E8', '#B5D4B5', '#7AAF7A', '#4A8A4A', '#2D5A2D'],
  'glam': ['#F5E6F0', '#E8B5D4', '#C47AAF', '#8B3A7A', '#5C1A4A'],
  'natural': ['#FAF0E6', '#F0D9C0', '#D4A574', '#A67C52', '#7A5C3A'],
};

function getSwatches(occasion: string, palette: string[]): string[] {
  if (palette && palette.length > 0) return palette;
  const key = Object.keys(PALETTE_PRESETS).find(k =>
    occasion?.toLowerCase().includes(k)
  ) || 'natural';
  return PALETTE_PRESETS[key];
}

function LookCard({ look, onDelete }: { look: Look; onDelete: (id: string) => void }) {
  const swatches = getSwatches(look.occasion, look.palette);

  return (
    <article className="rounded-3xl border bg-white shadow-sm overflow-hidden">
      <div className="flex h-3">
        {swatches.map((color, i) => (
          <div key={i} className="flex-1" style={{ background: color }} />
        ))}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-base">{look.title}</h3>
            {look.occasion && (
              <span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-0.5 text-xs text-neutral-600">
                {look.occasion}
              </span>
            )}
          </div>
          <button
            onClick={() => onDelete(look.id)}
            className="text-xs text-neutral-300 hover:text-neutral-500"
          >
            ✕
          </button>
        </div>
        {look.steps && look.steps.length > 0 && (
          <ol className="mt-4 grid gap-1.5">
            {look.steps.map((step, i) => (
              <li key={i} className="text-sm text-neutral-600">
                <span className="font-medium text-neutral-900">{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        )}
        {look.notes && (
          <p className="mt-3 text-xs text-neutral-400 italic">{look.notes}</p>
        )}
      </div>
    </article>
  );
}

function AddLookModal({ onSave, onClose }: { onSave: (look: Partial<Look>) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState('');
  const [stepsText, setStepsText] = useState('');

  function handleSave() {
    if (!title.trim()) return;
    const steps = stepsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    onSave({ title, occasion, steps, palette: [] });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-6">Save a look</h2>
        <div className="grid gap-4">
          <input
            className="rounded-2xl border p-3 text-sm"
            placeholder="Look name (e.g. Effortless Saturday)"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            className="rounded-2xl border p-3 text-sm"
            placeholder="Occasion (e.g. casual, evening, office)"
            value={occasion}
            onChange={e => setOccasion(e.target.value)}
          />
          <textarea
            className="min-h-[160px] rounded-2xl border p-3 text-sm"
            placeholder="Steps — one per line&#10;e.g. Tinted moisturizer, fingers&#10;NARS Orgasm blush, light hand&#10;Pillow Talk lip liner + gloss"
            value={stepsText}
            onChange={e => setStepsText(e.target.value)}
          />
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="rounded-2xl border px-5 py-2.5 text-sm">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded-2xl bg-black px-5 py-2.5 text-sm text-white disabled:opacity-30"
          >
            Save look
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadLooks();
  }, []);

  async function loadLooks() {
    const res = await fetch('/api/looks');
    const data = await res.json();
    if (res.ok) setLooks(data.looks || []);
  }

  async function saveLook(look: Partial<Look>) {
    const res = await fetch('/api/looks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(look),
    });
    if (res.ok) {
      setShowModal(false);
      loadLooks();
    }
  }

  async function deleteLook(id: string) {
    await fetch(`/api/looks?id=${id}`, { method: 'DELETE' });
    loadLooks();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/intake" className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-neutral-50">
          <h2 className="font-medium">Intake</h2>
          <p className="mt-2 text-sm text-neutral-600">Define your undertone, contrast, style goals, and frustrations.</p>
        </Link>
        <Link href="/inventory" className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-neutral-50">
          <h2 className="font-medium">Inventory</h2>
          <p className="mt-2 text-sm text-neutral-600">Track products, shades, notes, and favorites.</p>
        </Link>
        <Link href="/dossier" className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-neutral-50">
          <h2 className="font-medium">Dossier</h2>
          <p className="mt-2 text-sm text-neutral-600">Generate personalized style guidance from your data.</p>
        </Link>
        <Link href="/refine" className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-neutral-50">
          <h2 className="font-medium">Refine</h2>
          <p className="mt-2 text-sm text-neutral-600">Chat with your beauty advisor and log what worked.</p>
        </Link>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">My Playlist</h2>
            <p className="mt-1 text-sm text-neutral-500">Looks you've saved and made your own.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-2xl bg-black px-5 py-2.5 text-sm text-white"
          >
            + Save a look
          </button>
        </div>

        {looks.length === 0 ? (
          <div className="rounded-3xl border bg-white p-10 text-center">
            <p className="text-neutral-500 text-sm">No saved looks yet.</p>
            <p className="mt-2 text-neutral-400 text-sm">Chat with Maya to build a look, or save one manually.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {looks.map(look => (
              <LookCard key={look.id} look={look} onDelete={deleteLook} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddLookModal onSave={saveLook} onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
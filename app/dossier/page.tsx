'use client';

import { useState } from 'react';
import { DossierRenderer } from '@/components/dossier-renderer';
import { StoredDossier } from '@/lib/types';

export default function DossierPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dossier, setDossier] = useState<StoredDossier | null>(null);

  async function generateDossier() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/dossier', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to generate dossier'); setLoading(false); return; }
    setDossier(data.dossier);
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Dossier</h1>
          <p className="mt-3 text-neutral-600">Generate a personalized style dossier from your intake, inventory, and refinement notes.</p>
        </div>
        <button onClick={generateDossier} disabled={loading} className="rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate dossier'}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-8">
        {dossier ? (
          <DossierRenderer dossier={dossier.content} />
        ) : (
          <div className="rounded-3xl border bg-white p-8 text-neutral-600 shadow-sm">
            No dossier yet. Save your intake first, then generate one here.
          </div>
        )}
      </div>
    </main>
  );
}
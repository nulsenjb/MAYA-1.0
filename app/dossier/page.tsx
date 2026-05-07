'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DossierRenderer } from '@/components/dossier-renderer';
import { StoredDossier } from '@/lib/types';
import { createClient } from '@/lib/supabase-browser';

export default function DossierPage() {
  return (
    <Suspense fallback={null}>
      <DossierContent />
    </Suspense>
  );
}

function DossierContent() {
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dossier, setDossier] = useState<StoredDossier | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadDossier() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setInitialLoading(false);
        return;
      }
      const { data } = await supabase
        .from('dossiers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) {
        if (data) setDossier(data as StoredDossier);
        setInitialLoading(false);
      }
    }
    loadDossier();
    return () => { cancelled = true; };
  }, []);

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
      {isNew && (
        <div className="rounded-2xl bg-neutral-900 text-white px-6 py-5 mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">
              Your profile is ready
            </p>
            <p className="text-sm text-neutral-200 leading-relaxed">
              This is your personalized beauty guide — built around your coloring,
              your products, and how you like to wear makeup. Come back anytime to refine it.
            </p>
          </div>
          <Link href="/dashboard" className="text-xs text-neutral-400 hover:text-white whitespace-nowrap mt-0.5">
            Go to dashboard →
          </Link>
        </div>
      )}

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
        {initialLoading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : dossier ? (
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

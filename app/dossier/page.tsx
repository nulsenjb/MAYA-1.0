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

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 min-h-screen bg-rose-50">

      {isNew && (
        <div className="rounded-2xl border border-rose-200 bg-white p-8 mb-8 flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-3">
            Your profile is ready
          </p>
          <p className="text-sm text-rose-700 leading-relaxed max-w-md">
            This is your personalized beauty guide — built around your coloring, your products, and how you like to wear makeup. Come back anytime to refine it.
          </p>
          <Link
            href="/refine"
            className="mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
            style={{ background: 'var(--grad-deep)' }}
          >
            Explore with Maya →
          </Link>
        </div>
      )}

      {initialLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : dossier ? (
        <>
          <DossierRenderer dossier={dossier.content} />
          <div className="mt-12 flex justify-center">
            <Link
              href="/refine"
              className="rounded-2xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background: 'var(--grad-deep)' }}
            >
              Explore with Maya →
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-3xl border bg-white p-8 text-neutral-600 shadow-sm">
          No dossier yet. <Link href="/intake" className="underline">Complete your intake</Link> to generate one.
        </div>
      )}

    </main>
  );
}

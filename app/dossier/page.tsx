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
    <main className="mx-auto max-w-6xl px-6 py-12">
      {isNew && (
        <div className="rounded-2xl bg-neutral-900 text-white p-6 mb-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                Your profile is ready
              </p>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-md">
                This is your personalized beauty guide — built around your coloring, your products, and how you like to wear makeup. Come back anytime to refine it.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-neutral-500 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      )}

      {initialLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : dossier ? (
        <DossierRenderer dossier={dossier.content} />
      ) : (
        <div className="rounded-3xl border bg-white p-8 text-neutral-600 shadow-sm">
          No dossier yet. <Link href="/intake" className="underline">Complete your intake</Link> to generate one.
        </div>
      )}
    </main>
  );
}

'use client';

import { Fraunces } from 'next/font/google';
import { useState } from 'react';
import type { SavedLook } from '@/app/looks/page';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700'], style: ['normal', 'italic'] });

const CANONICAL = ['Everyday', 'Business', 'Out & About', 'Evening', 'Formal', 'Special Events'];
const DEFAULT_SWATCH = 'linear-gradient(to bottom, #E1B9AB, #C9A9B0)';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PaletteSwatch({ palette }: { palette: string[] }) {
  if (!palette || palette.length === 0) {
    return <div className="w-3 shrink-0 self-stretch rounded-l-2xl" style={{ background: DEFAULT_SWATCH }} />;
  }
  const pct = 100 / palette.length;
  const gradient = palette.map((c, i) => `${c} ${i * pct}% ${(i + 1) * pct}%`).join(', ');
  return <div className="w-3 shrink-0 self-stretch rounded-l-2xl" style={{ background: `linear-gradient(to bottom, ${gradient})` }} />;
}

function LookCard({ look, onDelete }: { look: SavedLook; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/looks?id=${look.id}`, { method: 'DELETE' });
    onDelete(look.id);
  }

  const stepCount = (look.steps ?? []).filter(s => s.trim()).length;

  return (
    <div className="flex-shrink-0 w-52 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden flex">
      <PaletteSwatch palette={look.palette} />
      <div className="flex flex-col gap-2 p-4 flex-1 min-w-0">
        <p className={`${fraunces.className} text-sm font-semibold text-rose-900 leading-tight`}>
          {look.title || 'Untitled look'}
        </p>
        {look.why && (
          <p className={`${fraunces.className} text-xs text-neutral-500 leading-relaxed`} style={{ fontStyle: 'italic' }}>
            {look.why}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            {stepCount > 0 && <span>{stepCount} step{stepCount !== 1 ? 's' : ''}</span>}
            <span>{formatDate(look.created_at)}</span>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete look"
            className="text-neutral-300 hover:text-rose-400 transition-colors text-xs disabled:opacity-40"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyRailCard({ category }: { category: string }) {
  return (
    <div className="flex-shrink-0 w-52 rounded-2xl border border-dashed border-neutral-200 bg-rose-50/60 p-4 flex items-center justify-center">
      <p className={`${fraunces.className} text-xs text-neutral-400 leading-relaxed text-center`} style={{ fontStyle: 'italic' }}>
        Nothing hanging here yet. The next {category} look you save with Maya will live on this rail.
      </p>
    </div>
  );
}

function ShelfSection({
  category,
  looks,
  onDelete,
}: {
  category: string;
  looks: SavedLook[];
  onDelete: (id: string) => void;
}) {
  return (
    <section className="mb-12">
      {/* Shelf header */}
      <div className="flex items-center gap-4 mb-5">
        <h2 className={`${fraunces.className} text-base font-semibold text-rose-900 shrink-0`}>{category}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-rose-200 to-transparent" />
        <span className="text-xs text-neutral-400 shrink-0">{looks.length}</span>
      </div>

      {/* Horizontal scrolling rail */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
        {looks.length === 0
          ? <EmptyRailCard category={category} />
          : looks.map((look) => (
              <LookCard key={look.id} look={look} onDelete={onDelete} />
            ))
        }
      </div>
    </section>
  );
}

export function ClosetView({ looks: initialLooks }: { looks: SavedLook[] }) {
  const [looks, setLooks] = useState<SavedLook[]>(initialLooks);

  function handleDelete(id: string) {
    setLooks(prev => prev.filter(l => l.id !== id));
  }

  // Group looks by lookbook
  const grouped = looks.reduce<Record<string, SavedLook[]>>((acc, look) => {
    const key = look.lookbook?.trim() || '__unsorted__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(look);
    return acc;
  }, {});

  // Counts for canonical categories (for the directory chips)
  const counts = CANONICAL.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = (grouped[cat] ?? []).length;
    return acc;
  }, {});
  const unsorted = grouped['__unsorted__'] ?? [];

  // Collect any non-canonical, non-unsorted lookbook names
  const extraCategories = Object.keys(grouped).filter(
    k => k !== '__unsorted__' && !CANONICAL.includes(k)
  );

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-28 md:pb-16 min-h-screen bg-rose-50">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-3">Lookbooks</p>
        <h1 className={`${fraunces.className} text-4xl sm:text-5xl font-semibold text-rose-900 mb-4`}>
          Your closet.
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-lg">
          The looks you and Maya have figured out together — organized the way you&apos;d actually reach for them.
        </p>
      </div>

      {/* Category directory chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CANONICAL.map((cat) => (
          <a
            key={cat}
            href={`#${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-100 transition-colors"
          >
            <span>{cat}</span>
            {counts[cat] > 0 && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 leading-none">
                {counts[cat]}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Canonical category shelves */}
      {CANONICAL.map((cat) => (
        <div key={cat} id={cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
          <ShelfSection
            category={cat}
            looks={grouped[cat] ?? []}
            onDelete={handleDelete}
          />
        </div>
      ))}

      {/* Extra (user-created) lookbook shelves */}
      {extraCategories.map((cat) => (
        <ShelfSection
          key={cat}
          category={cat}
          looks={grouped[cat]}
          onDelete={handleDelete}
        />
      ))}

      {/* Unsorted */}
      {unsorted.length > 0 && (
        <ShelfSection
          category="Unsorted"
          looks={unsorted}
          onDelete={handleDelete}
        />
      )}

    </main>
  );
}

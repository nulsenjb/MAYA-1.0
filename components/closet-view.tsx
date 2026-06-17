'use client';

import { Fraunces } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';
import type { SavedLook } from '@/app/looks/page';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600', '700'], style: ['normal', 'italic'] });

const CANONICAL = ['Everyday', 'Business', 'Out & About', 'Evening', 'Formal', 'Special Events'];
const DEFAULT_SWATCH = 'linear-gradient(to bottom, #E1B9AB, #C9A9B0)';
const DEFAULT_STRIP  = 'linear-gradient(to right, #E1B9AB, #C9A9B0)';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function paletteGradient(palette: string[], direction: 'bottom' | 'right' = 'bottom') {
  if (!palette || palette.length === 0) return direction === 'bottom' ? DEFAULT_SWATCH : DEFAULT_STRIP;
  const pct = 100 / palette.length;
  const stops = palette.map((c, i) => `${c} ${i * pct}% ${(i + 1) * pct}%`).join(', ');
  return `linear-gradient(to ${direction}, ${stops})`;
}

function PaletteSwatch({ palette }: { palette: string[] }) {
  return (
    <div
      className="w-3 shrink-0 self-stretch rounded-l-2xl"
      style={{ background: paletteGradient(palette, 'bottom') }}
    />
  );
}

function LookCard({
  look,
  onDelete,
  onOpen,
}: {
  look: SavedLook;
  onDelete: (id: string) => void;
  onOpen: (look: SavedLook) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(true);
    await fetch(`/api/looks?id=${look.id}`, { method: 'DELETE' });
    onDelete(look.id);
  }

  const stepCount = (look.steps ?? []).filter(s => s.trim()).length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(look)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(look)}
      className="flex-shrink-0 w-52 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden flex cursor-pointer hover:border-rose-300 hover:shadow-md transition-all"
    >
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
  onOpen,
}: {
  category: string;
  looks: SavedLook[];
  onDelete: (id: string) => void;
  onOpen: (look: SavedLook) => void;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-5">
        <h2 className={`${fraunces.className} text-base font-semibold text-rose-900 shrink-0`}>{category}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-rose-200 to-transparent" />
        <span className="text-xs text-neutral-400 shrink-0">{looks.length}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
        {looks.length === 0
          ? <EmptyRailCard category={category} />
          : looks.map((look) => (
              <LookCard key={look.id} look={look} onDelete={onDelete} onOpen={onOpen} />
            ))
        }
      </div>
    </section>
  );
}

function LookDetailModal({
  look,
  onClose,
}: {
  look: SavedLook;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const steps = (look.steps ?? []).filter(s => s.trim());

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Trap focus within modal on mount
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-rose-950/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={look.title || 'Look detail'}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full sm:max-w-lg sm:mx-4 sm:rounded-3xl rounded-t-3xl bg-white shadow-2xl overflow-hidden outline-none max-h-[90dvh] flex flex-col"
      >
        {/* Palette strip */}
        <div
          className="h-2 w-full shrink-0"
          style={{ background: paletteGradient(look.palette, 'right') }}
        />

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pt-6 pb-8">

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-700 transition-colors text-base leading-none"
          >
            ×
          </button>

          {/* Title + meta */}
          <h2 className={`${fraunces.className} text-2xl font-semibold text-rose-900 leading-tight pr-8`}>
            {look.title || 'Untitled look'}
          </h2>
          <p className="mt-1 text-xs text-neutral-400 flex items-center gap-2">
            {look.lookbook && <span>{look.lookbook}</span>}
            {look.lookbook && <span>·</span>}
            <span>{formatDate(look.created_at)}</span>
          </p>

          {/* Why */}
          {look.why && (
            <div className="mt-5 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-400 mb-1">Why this works for you</p>
              <p className={`${fraunces.className} text-sm text-rose-800 leading-relaxed`} style={{ fontStyle: 'italic' }}>
                {look.why}
              </p>
            </div>
          )}

          {/* Steps */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">To recreate</p>
            {steps.length === 0 ? (
              <p className="text-sm text-neutral-400 italic">No steps saved for this look yet.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-neutral-700 leading-relaxed">
                    <span className={`${fraunces.className} text-rose-300 font-semibold shrink-0 w-5 text-right`}>
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export function ClosetView({ looks: initialLooks }: { looks: SavedLook[] }) {
  const [looks, setLooks] = useState<SavedLook[]>(initialLooks);
  const [selectedLook, setSelectedLook] = useState<SavedLook | null>(null);

  function handleDelete(id: string) {
    setLooks(prev => prev.filter(l => l.id !== id));
    if (selectedLook?.id === id) setSelectedLook(null);
  }

  function handleOpen(look: SavedLook) {
    setSelectedLook(look);
  }

  function handleClose() {
    setSelectedLook(null);
  }

  const grouped = looks.reduce<Record<string, SavedLook[]>>((acc, look) => {
    const key = look.lookbook?.trim() || '__unsorted__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(look);
    return acc;
  }, {});

  const counts = CANONICAL.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = (grouped[cat] ?? []).length;
    return acc;
  }, {});
  const unsorted = grouped['__unsorted__'] ?? [];

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

      {/* Canonical shelves */}
      {CANONICAL.map((cat) => (
        <div key={cat} id={cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
          <ShelfSection
            category={cat}
            looks={grouped[cat] ?? []}
            onDelete={handleDelete}
            onOpen={handleOpen}
          />
        </div>
      ))}

      {/* Extra lookbook shelves */}
      {extraCategories.map((cat) => (
        <ShelfSection
          key={cat}
          category={cat}
          looks={grouped[cat]}
          onDelete={handleDelete}
          onOpen={handleOpen}
        />
      ))}

      {/* Unsorted */}
      {unsorted.length > 0 && (
        <ShelfSection
          category="Unsorted"
          looks={unsorted}
          onDelete={handleDelete}
          onOpen={handleOpen}
        />
      )}

      {/* Detail modal */}
      {selectedLook && (
        <LookDetailModal look={selectedLook} onClose={handleClose} />
      )}

    </main>
  );
}

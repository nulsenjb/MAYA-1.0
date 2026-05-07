'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type Look = {
  id: string;
  name: string;
  notes: string | null;
  created_at: string;
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export function LooksList({ looks: initial }: { looks: Look[] }) {
  const [looks, setLooks] = useState<Look[]>(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteLook(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from('looks').delete().eq('id', id);
    setDeletingId(null);
    if (!error) setLooks((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {looks.map((look) => (
        <div
          key={look.id}
          className="rounded-2xl border bg-white p-5 flex items-start justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-neutral-900">{look.name}</p>
            <p className="text-xs text-neutral-400 mt-1">{formatDate(look.created_at)}</p>
            {look.notes && <p className="text-xs text-neutral-500 mt-2">{look.notes}</p>}
          </div>
          <button
            type="button"
            onClick={() => deleteLook(look.id)}
            disabled={deletingId === look.id}
            className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-40"
          >
            {deletingId === look.id ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
}

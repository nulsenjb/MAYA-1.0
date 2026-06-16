'use client';

import { useState } from 'react';

export function WhyDisclosure({ why }: { why: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>Why this works for you</span>
      </button>
      {open && (
        <p className="mt-2 text-xs leading-relaxed text-neutral-500 italic pl-3 border-l border-neutral-200">
          {why}
        </p>
      )}
    </div>
  );
}

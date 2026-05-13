'use client';

import { useState } from 'react';

type Swatch = {
  color: string;
  label: string;
  looks: string[];
  tip: string;
};

const swatches: Swatch[] = [
  { color: '#F5EBE0', label: 'Cream', looks: ['Warm Effortless', 'Morning Glow'], tip: 'Let your makeup take center stage. Warm blush and bronzer shine against neutral clothing.' },
  { color: '#C4785E', label: 'Terracotta', looks: ['Warm Effortless', 'Golden Hour'], tip: 'Wearing your undertone — bold and harmonious. Balance with a lighter, more neutral eye.' },
  { color: '#9E3A2A', label: 'Deep Red', looks: ['Golden Hour', 'Evening'], tip: 'High drama. Gold highlight and a berry lip creates an intentional, complete look.' },
  { color: '#5A7A4A', label: 'Olive', looks: ['Warm Effortless'], tip: 'Olive and warm undertones are natural allies. Warm blush and bronzed eye reads earthy-elevated.' },
  { color: '#2A4A6A', label: 'Navy', looks: ['Fresh Classic', 'Evening'], tip: 'Navy makes bronze and copper tones in your makeup glow.' },
  { color: '#8B6FB0', label: 'Purple', looks: ['Golden Hour', 'Evening'], tip: 'Purple amplifies warmth in your skin. A gold highlight and nude-berry lip balances it.' },
  { color: '#171717', label: 'Black', looks: ['Golden Hour', 'Evening'], tip: 'A neutral canvas — your makeup does all the talking. Build more depth and drama.' },
  { color: '#B0B0B0', label: 'Grey', looks: ['Fresh Classic'], tip: 'Cool-neutral base. Warm blush and bronzed cheek brings life to your complexion.' },
  { color: '#FFFFFF', label: 'White', looks: ['Morning Glow'], tip: 'High contrast. A natural glowy look with blush and a tinted lip reads fresh, not washed out.' },
  { color: '#F4A7B0', label: 'Blush Pink', looks: ['Morning Glow', 'Warm Effortless'], tip: 'Keep your makeup cheeks in warmer peach so they do not compete with the clothing.' },
  { color: '#D4A020', label: 'Gold', looks: ['Warm Effortless', 'Golden Hour'], tip: 'Gold and warm undertones amplify each other. Lean into it.' },
  { color: '#C9956C', label: 'Camel', looks: ['Warm Effortless'], tip: 'Earthy and warm. A bronzed, monochromatic look reads effortlessly polished.' },
];

type Props = {
  onLookSelect?: (look: string) => void;
};

export function OutfitPicker({ onLookSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const activeSwatch = swatches.find((s) => s.color === selected) ?? null;

  return (
    <div className="rounded-2xl border bg-white p-6">
      <p className="mb-4 text-sm font-semibold text-neutral-900">What are you wearing?</p>
      <div className="flex flex-wrap gap-3">
        {swatches.map((s) => (
          <button
            key={s.color}
            aria-label={s.label}
            onClick={() => setSelected(selected === s.color ? null : s.color)}
            className="h-12 w-12 rounded-xl transition-all"
            style={{
              backgroundColor: s.color,
              border: selected === s.color ? '3px solid #171717' : '2px solid #e5e5e5',
              transform: selected === s.color ? 'scale(1.12)' : 'scale(1)',
              outline: s.color === '#FFFFFF' ? '1px solid #e5e5e5' : undefined,
            }}
          />
        ))}
      </div>

      {activeSwatch && (
        <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">{activeSwatch.label}</p>
          <p className="text-sm leading-6 text-neutral-700">{activeSwatch.tip}</p>
          {activeSwatch.looks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeSwatch.looks.map((look) => (
                <button
                  key={look}
                  onClick={() => onLookSelect?.(look)}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-brand hover:text-white transition-colors"
                >
                  {look}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

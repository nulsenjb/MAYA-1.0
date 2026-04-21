'use client';

import { useState } from 'react';

type Question = {
  id: string;
  question: string;
  subtitle?: string;
  type: 'choice' | 'text';
  options?: string[];
  placeholder?: string;
};

const questions: Question[] = [
  {
    id: 'vein_color',
    question: 'Look at the veins on the inside of your wrist. What color are they?',
    subtitle: 'Check in natural daylight for the most accurate result.',
    type: 'choice',
    options: [
      'Blue or purple',
      'Green or olive',
      'A mix of blue and green',
      'Hard to tell',
    ],
  },
  {
    id: 'sun_reaction',
    question: 'How does your skin react to sun exposure?',
    type: 'choice',
    options: [
      'I burn easily and rarely tan',
      'I burn first, then tan',
      'I tan easily and rarely burn',
      'My skin deepens but never burns',
    ],
  },
  {
    id: 'complexion_depth',
    question: 'How would you describe your skin tone depth?',
    type: 'choice',
    options: [
      'Fair — very light, often porcelain',
      'Fair-light — light with some warmth or pink',
      'Light — medium-light, neither very fair nor tan',
      'Light-medium — golden or peachy light tan',
      'Medium — olive, tan, or warm beige',
      'Medium-deep — rich tan or warm brown',
      'Deep — deep brown to darkest brown',
    ],
  },
  {
    id: 'eye_color',
    question: 'What is your eye color?',
    type: 'choice',
    options: [
      'Dark brown or black',
      'Medium brown',
      'Hazel — green-brown mix',
      'Green',
      'Blue-gray or gray',
      'Blue',
      'Amber or light brown',
    ],
  },
  {
    id: 'hair_color',
    question: 'What is your natural or current hair color?',
    type: 'choice',
    options: [
      'Black',
      'Dark brown',
      'Medium or warm brown',
      'Light brown or caramel',
      'Blonde — cool or ash',
      'Blonde — warm or golden',
      'Red or auburn',
      'Gray or silver',
      'White',
    ],
  },
  {
    id: 'jewelry_preference',
    question: 'Which jewelry tone do you feel looks best on you?',
    subtitle: 'Hold a gold and silver piece up to your face — which makes your skin look more alive?',
    type: 'choice',
    options: [
      'Gold — it warms my skin up',
      'Silver — it brightens my complexion',
      'Rose gold — it softens my look',
      'Both look equally good on me',
    ],
  },
  {
    id: 'style_goal',
    question: 'What do you want your look to say about you?',
    subtitle: 'Describe the feeling or impression you want to create — polished, effortless, bold, soft, etc.',
    type: 'text',
    placeholder: 'e.g. I want to look put-together but not overdone. Confident and warm.',
  },
  {
    id: 'frustrations',
    question: 'What is your biggest beauty frustration right now?',
    subtitle: 'Be as specific as you like — products, colors, routines, anything.',
    type: 'text',
    placeholder: 'e.g. I buy blushes that look great in the store but wrong on my face.',
  },
  {
    id: 'foundation_product',
    question: 'What foundation or concealer do you currently use?',
    subtitle: 'Brand, product name, and shade if you know it.',
    type: 'text',
    placeholder: 'e.g. Giorgio Armani Luminous Silk in shade 3.5, or "I don\'t wear foundation"',
  },
  {
    id: 'loved_products',
    question: 'What other products do you currently love or rely on?',
    subtitle: 'Blush, lip, mascara, skincare — anything you reach for regularly.',
    type: 'text',
    placeholder: 'e.g. NARS Orgasm blush, Charlotte Tilbury Pillow Talk lip liner',
  },
];

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const current = questions[step];
  const progress = Math.round((step / questions.length) * 100);
  const isLast = step === questions.length - 1;
  const answer = form[current.id] || '';

  function selectOption(value: string) {
    setForm({ ...form, [current.id]: value });
  }

  async function next() {
    if (isLast) {
      await save();
    } else {
      setStep(step + 1);
    }
  }

  async function save() {
    setSaving(true);

    const depthMap: Record<string, string> = {
      'Fair — very light, often porcelain': 'fair',
      'Fair-light — light with some warmth or pink': 'fair-light',
      'Light — medium-light, neither very fair nor tan': 'light',
      'Light-medium — golden or peachy light tan': 'light-medium',
      'Medium — olive, tan, or warm beige': 'medium',
      'Medium-deep — rich tan or warm brown': 'medium-deep',
      'Deep — deep brown to darkest brown': 'deep',
    };

    const undertoneMap: Record<string, string> = {
      'Blue or purple': 'cool',
      'Green or olive': 'warm',
      'A mix of blue and green': 'neutral',
      'Hard to tell': 'neutral',
    };

    const contrastMap: Record<string, string> = {
      'Dark brown or black': 'high',
      'Medium brown': 'medium',
      'Hazel — green-brown mix': 'medium',
      'Green': 'medium',
      'Blue-gray or gray': 'soft',
      'Blue': 'soft',
      'Amber or light brown': 'soft',
    };

    const payload = {
      age_range: 'not specified',
      complexion_depth: depthMap[form.complexion_depth] || 'medium',
      undertone: undertoneMap[form.vein_color] || 'neutral',
      overtone: form.sun_reaction || '',
      contrast_level: contrastMap[form.eye_color] || 'medium',
      eye_color: form.eye_color || '',
      hair_color: form.hair_color || '',
      goals: [form.style_goal].filter(Boolean),
      frustrations: [form.frustrations].filter(Boolean),
      preferred_finish: '',
      preferred_style: [form.jewelry_preference].filter(Boolean),
      jewelry_preference: form.jewelry_preference || '',
      wardrobe_colors: '',
      notes: `Foundation: ${form.foundation_product || 'not specified'}. Loved products: ${form.loved_products || 'not specified'}.`,
    };

    const res = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSaving(false);
      setGenerating(true);
      const dossierRes = await fetch('/api/dossier', { method: 'POST' });
      if (dossierRes.ok) {
        window.location.href = '/dossier';
      } else {
        window.location.href = '/dossier';
      }
    } else {
      setSaving(false);
    }
  }

  if (generating) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Building your dossier...</h1>
        <p className="mt-4 text-neutral-500">This takes about 15 seconds. Please don't close this page.</p>
        <div className="mt-8 flex justify-center">
          <div className="h-2 w-48 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-2 rounded-full bg-black animate-pulse w-full" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-neutral-500">Question {step + 1} of {questions.length}</p>
          <p className="text-sm text-neutral-500">{progress}%</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-100">
          <div
            className="h-1.5 rounded-full bg-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">{current.question}</h2>
        {current.subtitle && (
          <p className="mt-2 text-sm text-neutral-500 leading-6">{current.subtitle}</p>
        )}

        <div className="mt-6">
          {current.type === 'choice' && (
            <div className="grid gap-3">
              {current.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => selectOption(option)}
                  className={`rounded-2xl border px-5 py-3 text-left text-sm transition-all ${
                    answer === option
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {current.type === 'text' && (
            <textarea
              className="min-h-[140px] w-full rounded-2xl border border-neutral-200 p-4 text-sm focus:border-black focus:outline-none"
              placeholder={current.placeholder}
              value={answer}
              onChange={(e) => setForm({ ...form, [current.id]: e.target.value })}
            />
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="text-sm text-neutral-500 underline">
              Back
            </button>
          ) : <span />}
          <button
            onClick={next}
            disabled={!answer.trim() || saving}
            className="rounded-2xl bg-black px-6 py-3 text-white disabled:opacity-30"
          >
            {saving ? 'Saving...' : isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </main>
  );
}
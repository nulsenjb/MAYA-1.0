'use client';

import { useState } from 'react';

type QuestionType = 'text' | 'choice' | 'multiselect';

type Question = {
  id: string;
  question: string;
  subtitle?: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  optional?: boolean;
};

const questions: Question[] = [
  {
    id: 'name',
    question: "First, what's your name?",
    type: 'text',
    placeholder: 'e.g. Sarah',
  },
  {
    id: 'age_range',
    question: 'What is your age range?',
    type: 'choice',
    options: ['25–34', '35–44', '45–54', '55+'],
  },
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
      'Very fair',
      'Fair',
      'Light',
      'Light-medium',
      'Medium',
      'Medium-deep',
      'Deep',
    ],
  },
  {
    id: 'skin_type',
    question: 'How would you describe your skin type?',
    type: 'choice',
    options: [
      'Very dry',
      'Drier in winter, less dry in summer',
      'Combination — oily T-zone, dry otherwise',
      'Oily',
      'Acne prone',
      'Normal',
    ],
  },
  {
    id: 'hair_color',
    question: 'How would you describe your natural hair color?',
    subtitle: 'Be as specific as you like — e.g. medium brown, dark blonde, gray blended.',
    type: 'text',
    placeholder: 'e.g. warm medium brown with some gray',
  },
  {
    id: 'eye_color',
    question: 'How would you describe your eye color?',
    type: 'text',
    placeholder: 'e.g. hazel — green-brown mix with gold flecks',
  },
  {
    id: 'jewelry_preference',
    question: 'Which jewelry tone feels most natural on you?',
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
    id: 'makeup_experience',
    question: 'Which statement feels closest to your experience?',
    type: 'choice',
    options: [
      'Makeup usually looks great on me',
      'Makeup sometimes looks good, sometimes "off"',
      'Makeup rarely looks how I expect',
      'I feel confused by makeup most of the time',
    ],
  },
  {
    id: 'what_goes_wrong',
    question: 'When makeup feels "off," what usually happens?',
    subtitle: 'Select all that apply.',
    type: 'multiselect',
    options: [
      'Blush looks too orange or muddy',
      'I look tired or gray',
      'Colors feel overpowering',
      'My face looks flat or lifeless',
      'My makeup disappears quickly',
      "I can't pinpoint the issue",
    ],
  },
  {
    id: 'help_wanted',
    question: 'What would you most hope this app helps you with?',
    type: 'choice',
    options: [
      'Confidence while doing my makeup',
      'Simplifying my choices',
      'Understanding my undertone for future shopping',
      'Something else',
    ],
  },
  {
    id: 'struggle_categories',
    question: 'Which categories do you struggle with most?',
    subtitle: 'Select up to 3.',
    type: 'multiselect',
    options: [
      'Blush',
      'Foundation',
      'Bronzer',
      'Lips',
      'Eyes',
      'Everything 😅',
    ],
  },
  {
    id: 'desired_feeling',
    question: 'How would you like to feel when your makeup is "right"?',
    subtitle: 'Select up to 3.',
    type: 'multiselect',
    options: [
      'Polished',
      'Natural',
      'Confident',
      'Soft',
      'Elevated',
      'Fresh',
      'Put together',
      'Effortless',
    ],
  },
  {
    id: 'situations',
    question: 'What situations do you most want help with?',
    type: 'choice',
    options: [
      'Everyday / work',
      'Date night / evenings out',
      'Special events',
      'All of the above',
    ],
  },
  {
    id: 'style_goal',
    question: 'What do you want your look to say about you?',
    subtitle: 'In your own words — describe the feeling or impression you want to create.',
    type: 'text',
    placeholder: 'e.g. I want to look put-together but not overdone. Warm and confident.',
  },
  {
    id: 'frustrations',
    question: 'What is your biggest beauty frustration right now?',
    subtitle: 'Be as specific as you like.',
    type: 'text',
    placeholder: 'e.g. I buy blushes that look great in the store but wrong on my face.',
    optional: true,
  },
  {
    id: 'foundation_product',
    question: 'What foundation or concealer do you currently use?',
    subtitle: 'Brand, product name, and shade if you know it.',
    type: 'text',
    placeholder: 'e.g. Giorgio Armani Luminous Silk in shade 3.5, or "I don\'t wear foundation"',
    optional: true,
  },
  {
    id: 'loved_products',
    question: 'What other products do you currently love or rely on?',
    subtitle: 'Blush, lip, mascara, skincare — anything you reach for regularly.',
    type: 'text',
    placeholder: 'e.g. NARS Orgasm blush, Charlotte Tilbury Pillow Talk lip liner',
    optional: true,
  },
];

const depthMap: Record<string, string> = {
  'Very fair': 'fair',
  'Fair': 'fair',
  'Light': 'light',
  'Light-medium': 'light-medium',
  'Medium': 'medium',
  'Medium-deep': 'medium-deep',
  'Deep': 'deep',
};

const undertoneMap: Record<string, string> = {
  'Blue or purple': 'cool',
  'Green or olive': 'warm',
  'A mix of blue and green': 'neutral',
  'Hard to tell': 'neutral',
};

const contrastMap: Record<string, string> = {
  'Very fair': 'soft',
  'Fair': 'soft',
  'Light': 'soft',
  'Light-medium': 'medium',
  'Medium': 'medium',
  'Medium-deep': 'high',
  'Deep': 'high',
};

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string | string[]>>({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const current = questions[step];
  const progress = Math.round((step / questions.length) * 100);
  const isLast = step === questions.length - 1;
  const answer = form[current.id];
  const hasAnswer = current.optional
    ? true
    : Array.isArray(answer)
    ? answer.length > 0
    : typeof answer === 'string' && answer.trim().length > 0;

  function selectOption(value: string) {
    setForm({ ...form, [current.id]: value });
  }

  function toggleMulti(value: string) {
    const current_vals = (form[current.id] as string[]) || [];
    if (current_vals.includes(value)) {
      setForm({ ...form, [current.id]: current_vals.filter(v => v !== value) });
    } else {
      setForm({ ...form, [current.id]: [...current_vals, value] });
    }
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

    const depth = form.complexion_depth as string || '';
    const payload = {
      age_range: form.age_range as string || '',
      complexion_depth: depthMap[depth] || 'medium',
      undertone: undertoneMap[form.vein_color as string] || 'neutral',
      overtone: form.sun_reaction as string || '',
      contrast_level: contrastMap[depth] || 'medium',
      eye_color: form.eye_color as string || '',
      hair_color: form.hair_color as string || '',
      goals: [
        form.style_goal,
        form.help_wanted,
        form.situations,
        ...(Array.isArray(form.desired_feeling) ? form.desired_feeling : []),
      ].filter(Boolean) as string[],
      frustrations: [
        form.frustrations,
        ...(Array.isArray(form.what_goes_wrong) ? form.what_goes_wrong : []),
      ].filter(Boolean) as string[],
      preferred_finish: '',
      preferred_style: Array.isArray(form.desired_feeling) ? form.desired_feeling : [],
      jewelry_preference: form.jewelry_preference as string || '',
      wardrobe_colors: '',
      notes: [
        form.name ? `Name: ${form.name}` : '',
        form.skin_type ? `Skin type: ${form.skin_type}` : '',
        form.makeup_experience ? `Makeup experience: ${form.makeup_experience}` : '',
        Array.isArray(form.struggle_categories) && form.struggle_categories.length > 0
          ? `Struggles with: ${form.struggle_categories.join(', ')}`
          : '',
        form.foundation_product ? `Foundation: ${form.foundation_product}` : '',
        form.loved_products ? `Loved products: ${form.loved_products}` : '',
      ].filter(Boolean).join('. '),
    };

    const res = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSaving(false);
      setGenerating(true);
      await fetch('/api/dossier', { method: 'POST' });
      window.location.href = '/dossier';
    } else {
      setSaving(false);
    }
  }

  if (generating) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Building your dossier...</h1>
        <p className="mt-4 text-neutral-500 leading-7">
          {form.name ? `Hang tight, ${form.name}. ` : 'Hang tight. '}
          This takes about 15 seconds. Please don't close this page.
        </p>
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
        {current.optional && (
          <p className="mt-1 text-xs text-neutral-400">Optional — you can skip this one</p>
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

          {current.type === 'multiselect' && (
            <div className="grid gap-3">
              {current.options?.map((option) => {
                const selected = Array.isArray(answer) && answer.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleMulti(option)}
                    className={`rounded-2xl border px-5 py-3 text-left text-sm transition-all flex items-center justify-between ${
                      selected
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {option}
                    {selected && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          )}

          {current.type === 'text' && (
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-neutral-200 p-4 text-sm focus:border-black focus:outline-none"
              placeholder={current.placeholder}
              value={(answer as string) || ''}
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
            disabled={!hasAnswer || saving}
            className="rounded-2xl bg-black px-6 py-3 text-white disabled:opacity-30"
          >
            {saving ? 'Saving...' : isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </main>
  );
}
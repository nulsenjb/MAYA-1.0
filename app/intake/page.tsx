'use client';

import { useEffect, useState } from 'react';

const defaultForm = {
  age_range: '',
  complexion_depth: '',
  undertone: '',
  overtone: '',
  contrast_level: '',
  eye_color: '',
  hair_color: '',
  goals: [],
  frustrations: [],
  preferred_finish: '',
  preferred_style: [],
  jewelry_preference: '',
  wardrobe_colors: '',
  notes: '',
};

export default function IntakePage() {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadExisting() {
      const res = await fetch('/api/intake');
      const data = await res.json();
      if (res.ok && data.intake) setForm({ ...defaultForm, ...data.intake });
      setLoading(false);
    }
    loadExisting();
  }, []);

  async function saveIntake() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Failed to save intake'); setSaving(false); return; }
    setMessage('Intake saved successfully.');
    setSaving(false);
  }

  if (loading) return <main className="mx-auto max-w-5xl px-6 py-12">Loading...</main>;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Intake</h1>
      <p className="mt-3 text-neutral-600">Capture the harmony variables behind your best makeup and style choices.</p>
      <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border p-3" placeholder="Age range" value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })} />
          <input className="rounded-2xl border p-3" placeholder="Complexion depth" value={form.complexion_depth} onChange={(e) => setForm({ ...form, complexion_depth: e.target.value })} />
          <input className="rounded-2xl border p-3" placeholder="Undertone" value={form.undertone} onChange={(e) => setForm({ ...form, undertone: e.target.value })} />
          <input className="rounded-2xl border p-3" placeholder="Contrast level" value={form.contrast_level} onChange={(e) => setForm({ ...form, contrast_level: e.target.value })} />
          <input className="rounded-2xl border p-3" placeholder="Eye color" value={form.eye_color} onChange={(e) => setForm({ ...form, eye_color: e.target.value })} />
          <input className="rounded-2xl border p-3" placeholder="Hair color" value={form.hair_color} onChange={(e) => setForm({ ...form, hair_color: e.target.value })} />
          <input className="rounded-2xl border p-3" placeholder="Preferred finish" value={form.preferred_finish} onChange={(e) => setForm({ ...form, preferred_finish: e.target.value })} />
          <input className="rounded-2xl border p-3" placeholder="Jewelry preference" value={form.jewelry_preference} onChange={(e) => setForm({ ...form, jewelry_preference: e.target.value })} />
          <input className="rounded-2xl border p-3 md:col-span-2" placeholder="Wardrobe colors" value={form.wardrobe_colors} onChange={(e) => setForm({ ...form, wardrobe_colors: e.target.value })} />
        </div>
        <textarea
          className="mt-4 min-h-[160px] w-full rounded-2xl border p-3"
          placeholder="Notes about coloring, formulas, recurring frustrations, or what usually works best"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button onClick={saveIntake} disabled={saving} className="mt-6 rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-50">
          {saving ? 'Saving...' : 'Save intake'}
        </button>
        {message && <p className="mt-4 text-sm text-neutral-600">{message}</p>}
      </div>
    </main>
  );
}
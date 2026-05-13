import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: intake } = await supabase
    .from('intake_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!intake) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-2xl font-semibold tracking-tight mb-6">
            Your profile isn&apos;t built yet.
          </h1>
          <Link
            href="/intake"
            className="rounded-xl bg-brand text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#C08878] transition-colors"
          >
            Begin your intake →
          </Link>
        </div>
      </main>
    );
  }

  const nameMatch = intake.notes?.match(/Name:\s*([^.]+)/);
  const firstName = nameMatch ? nameMatch[1].trim().split(' ')[0] : '';
  const heading = firstName ? `${firstName}'s coloring snapshot` : 'Your coloring snapshot';

  const cards = [
    {
      label: 'Undertone',
      value: intake.undertone || '—',
      detail: 'The foundation of your color palette',
    },
    {
      label: 'Skin Depth',
      value: intake.complexion_depth || '—',
      detail: 'How your skin reads in light and shadow',
    },
    {
      label: 'Hair Color',
      value: intake.hair_color || '—',
      detail: 'Shapes which tones harmonize with you',
    },
    {
      label: 'Eye Color',
      value: intake.eye_color || '—',
      detail: 'Influences contrast and color choices',
    },
  ];

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
        Your profile
      </p>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">{heading}</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Everything Maya knows about your coloring — the foundation of every recommendation.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">
              {c.label}
            </p>
            <p className="text-lg font-semibold text-neutral-900">{c.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
          Maya&apos;s analysis
        </p>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {intake.ai_summary || 'Complete your intake to generate your coloring analysis.'}
        </p>
      </div>

      <div className="flex gap-6">
        <Link href="/dossier" className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors">
          View your full dossier →
        </Link>
        <Link href="/refine" className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors">
          Refine your profile →
        </Link>
      </div>
    </main>
  );
}

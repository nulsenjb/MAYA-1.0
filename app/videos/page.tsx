import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

const categories = ['All', 'Base & Skin', 'Cheeks', 'Eyes & Brows', 'Lips', 'Full Looks', 'Mature Skin'];

const videos = [
  { cat: 'Base & Skin', title: 'Why fingertips beat brushes for a natural finish', duration: '4:00' },
  { cat: 'Cheeks', title: 'Blush placement for warm undertones', duration: '3:00' },
  { cat: 'Cheeks', title: 'The 3-shape bronzer method', duration: '2:30' },
  { cat: 'Eyes & Brows', title: 'Wet vs dry brush — shadow depth and diffusion', duration: '3:30' },
  { cat: 'Eyes & Brows', title: 'Eyeliner techniques for over 40', duration: '4:00' },
  { cat: 'Eyes & Brows', title: 'Natural brow shaping — warm coloring', duration: '2:00' },
  { cat: 'Base & Skin', title: 'Layering base products without pilling', duration: '3:00' },
  { cat: 'Lips', title: 'Liner + lipstick — extending wear all day', duration: '2:30' },
  { cat: 'Full Looks', title: 'Warm Effortless — complete walkthrough', duration: '6:00' },
  { cat: 'Full Looks', title: 'Golden Hour — evening look walkthrough', duration: '7:00' },
  { cat: 'Mature Skin', title: 'Makeup that moves with you, not against you', duration: '5:00' },
  { cat: 'Mature Skin', title: 'Setting and finishing for longevity', duration: '3:30' },
];

const voteTopics = [
  'Contouring for beginners',
  'Concealer under-eye',
  'Skincare layering order',
  'Mascara for mature lashes',
  'Day-to-night transitions',
  'Makeup removal',
  'Setting & finishing',
];

function PlayIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 translate-x-0.5">
        <path d="M4 2.5l9 5.5-9 5.5V2.5z" fill="#171717" />
      </svg>
    </div>
  );
}

export default async function VideosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <div className="rounded-2xl bg-neutral-900 p-8 mb-8">
        <p className="mb-2 text-sm font-semibold text-neutral-500">Maya · Tutorial Library</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Learn from Adi.</h1>
        <p className="mt-3 max-w-xl text-neutral-400 leading-7">
          Short, practical videos built from 2+ years of personal experimentation. No sponsorships, no fluff — just what actually works as we age.
        </p>
      </div>

      {/* Featured placeholder */}
      <div className="overflow-hidden rounded-2xl border bg-white mb-8">
        <div className="relative flex aspect-video items-center justify-center bg-neutral-900">
          <PlayIcon />
        </div>
        <div className="p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Foundation · Base</p>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Why fingertips beat brushes for a natural finish</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            The single technique change that eliminates pilling and gives skin a lived-in, natural finish.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
              i === 0
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {videos.map((v) => (
          <div key={v.title} className="cursor-pointer overflow-hidden rounded-2xl border bg-white hover:border-neutral-400 transition-colors">
            <div className="relative flex aspect-video items-center justify-center bg-neutral-900">
              <PlayIcon />
              {/* Duration badge */}
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                {v.duration}
              </span>
              {/* Category badge */}
              <span className="absolute left-2 top-2 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                {v.cat}
              </span>
            </div>
            <div className="p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">{v.cat}</p>
              <p className="text-sm font-semibold text-neutral-900">{v.title}</p>
              <p className="mt-1 text-xs text-neutral-400">By Adi · Coming soon</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vote section */}
      <div className="rounded-2xl border bg-neutral-50 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold tracking-tight text-neutral-900">What should Adi film next?</h2>
        <p className="mb-5 text-sm text-neutral-500">Vote for the topics you want most.</p>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {voteTopics.map((topic) => (
            <button
              key={topic}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
        <button className="rounded-2xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors">
          Submit votes
        </button>
      </div>
    </main>
  );
}

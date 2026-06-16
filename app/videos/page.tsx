import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

const categories = ['All', 'Why this happens', 'When it feels too harsh', 'When you disappear', 'Harmony fixes', 'What changed with age', 'Breakthrough moments'];

const videos = [
  { cat: 'Why this happens', title: 'Why your blush turns orange', duration: '0:50' },
  { cat: 'Why this happens', title: 'Why concealer makes you look tired', duration: '1:00' },
  { cat: 'Why this happens', title: 'Why you disappear in certain colors', duration: '0:55' },
  { cat: 'When it feels too harsh', title: 'The one-inch blush shift that softens everything', duration: '1:10' },
  { cat: 'When it feels too harsh', title: 'Warming only the edges, not the center', duration: '1:00' },
  { cat: 'When you disappear', title: 'Where to place brightness to reconnect your face', duration: '1:15' },
  { cat: 'Harmony fixes', title: 'Moving blush up and out — and why it works', duration: '0:50' },
  { cat: 'Harmony fixes', title: 'Fixing a muddy bronzer in one step', duration: '1:05' },
  { cat: 'What changed with age', title: 'Why brightness matters more now than coverage', duration: '1:20' },
  { cat: 'What changed with age', title: 'Why your old foundation stopped working', duration: '1:10' },
  { cat: 'Breakthrough moments', title: 'The moment I stopped copying placement from influencers', duration: '1:25' },
  { cat: 'Breakthrough moments', title: 'The difference between brightness and lightness', duration: '1:15' },
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
        <p className="mb-2 text-sm font-semibold text-neutral-500">Maya · Video Library</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Explore with me.</h1>
        <p className="mt-3 max-w-xl text-neutral-400 leading-7">
          Short clips from my own makeup journey — the moments things finally clicked, and why. No expert lecturing, no sponsorships. Just what I've figured out.
        </p>
      </div>

      {/* Featured placeholder */}
      <div className="overflow-hidden rounded-2xl border bg-white mb-8">
        <div className="relative flex aspect-video items-center justify-center bg-neutral-900">
          <PlayIcon />
        </div>
        <div className="p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Why this happens</p>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Why your blush turns orange</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            It&apos;s not the blush — it&apos;s the undertone clash. Here&apos;s what&apos;s actually happening on your skin.
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
                ? 'border-brand bg-brand text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-brand'
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
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-brand hover:bg-brand hover:text-white transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
        <button className="rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-[#C08878] transition-colors">
          Submit votes
        </button>
      </div>
    </main>
  );
}

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-500">
            Personalized beauty, style, and harmony
          </p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Unlock the magic already inside you.
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-600">
            Build your beauty profile, track what you own, generate a personalized dossier,
            and refine your style over time with guidance tailored to your undertone,
            contrast, wardrobe, and real-life results.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/auth/signup" className="rounded-2xl bg-black px-5 py-3 text-white">Get started</Link>
            <Link href="/auth/login" className="rounded-2xl border px-5 py-3">Log in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
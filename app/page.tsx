import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#D4A090' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div
            className="text-3xl font-light tracking-[0.22em] uppercase"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            MAYA
          </div>
        </div>
        <p
          className="mb-4 text-sm uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Beauty, Style, and Harmony
        </p>
        <h1
          className="text-2xl sm:text-3xl font-semibold tracking-tight"
          style={{ color: 'rgba(255,255,255,0.97)' }}
        >
          Personalized beauty that finally makes sense.
        </h1>
        <p
          className="mt-6 text-lg leading-8"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Discover the colors, combinations, and techniques that bring your features into harmony — built around your undertone, your wardrobe, and the products you already own.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/signup"
            className="w-full rounded-2xl px-5 py-3 text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.97)', color: '#7A4030' }}
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="w-full rounded-2xl border px-5 py-3 text-center"
            style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}

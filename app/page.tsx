import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'var(--wash-hero)' }}
    >
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="mb-10">
          <div className="text-3xl font-light tracking-[0.22em] uppercase text-rose-800">
            MAYA
          </div>
        </div>

        {/* Hero */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-rose-900">
          Stop Chasing Products. Start Understanding Yourself.
        </h1>
        <p className="mt-5 text-base leading-7 text-rose-700">
          Through personalized guidance, Maya helps you discover why makeup behaves differently on you — and what to do about it.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/signup"
            className="w-full rounded-2xl px-5 py-3 text-center text-sm font-semibold text-white"
            style={{ background: 'var(--grad-deep)' }}
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="w-full rounded-2xl border border-rose-300 px-5 py-3 text-center text-sm text-rose-700 hover:bg-rose-100 transition-colors"
          >
            Log in
          </Link>
        </div>

        {/* About link */}
        <div className="mt-6 text-center">
          <Link href="/about" className="text-xs text-rose-400 hover:text-rose-600 transition-colors">
            About Maya
          </Link>
        </div>

      </div>
    </main>
  );
}

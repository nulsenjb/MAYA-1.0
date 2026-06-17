import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: '#D4A090' }}
    >
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="mb-10">
          <div
            className="text-3xl font-light tracking-[0.22em] uppercase"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            MAYA
          </div>
        </div>

        {/* Hero */}
        <h1
          className="text-2xl sm:text-3xl font-semibold tracking-tight"
          style={{ color: 'rgba(255,255,255,0.97)' }}
        >
          Stop Chasing Products. Start Understanding Yourself.
        </h1>
        <p
          className="mt-5 text-base leading-7"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          Through personalized guidance, Maya helps you discover why makeup behaves differently on you — and what to do about it.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/signup"
            className="w-full rounded-2xl px-5 py-3 text-center text-sm font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.97)', color: '#7A4030' }}
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="w-full rounded-2xl border px-5 py-3 text-center text-sm"
            style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Log in
          </Link>
        </div>

        {/* About link */}
        <div className="mt-6 text-center">
          <Link
            href="/about"
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            About Maya
          </Link>
        </div>

      </div>
    </main>
  );
}

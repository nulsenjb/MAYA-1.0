import Link from 'next/link';

function PlayIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 translate-x-0.5">
        <path d="M4 2.5l9 5.5-9 5.5V2.5z" fill="#171717" />
      </svg>
    </div>
  );
}

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

        {/* Founder section */}
        <div
          className="mt-10 rounded-2xl p-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <p
            className="text-sm leading-7"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            I&apos;m not a beauty expert. For years I bought the &ldquo;right&rdquo; products and still felt like makeup looked wrong on me — too heavy, too orange, somehow disconnected. Maya came out of trying to understand why. The more I dug in, the more I realized it was never about buying more — it was about harmony, and about finally seeing my own face clearly.
          </p>
          <p
            className="mt-4 text-xs font-semibold tracking-wide"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            — Adi, founder
          </p>
        </div>

        {/* Founder video placeholder */}
        <div
          className="mt-4 overflow-hidden rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="relative flex aspect-video items-center justify-center">
            <PlayIcon />
          </div>
          <div className="px-4 py-3">
            <p
              className="text-xs font-semibold"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              Why I built Maya
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

      </div>
    </main>
  );
}

import Link from 'next/link';

function PlayIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70">
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 translate-x-0.5">
        <path d="M4 2.5l9 5.5-9 5.5V2.5z" fill="#7A4030" />
      </svg>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'var(--wash-hero)' }}
    >
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="mb-10">
          <Link href="/">
            <div className="text-3xl font-light tracking-[0.22em] uppercase text-rose-800">
              MAYA
            </div>
          </Link>
        </div>

        {/* Page title */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-rose-900">
          About Maya
        </h1>

        {/* Founder story */}
        <div className="mt-8 rounded-2xl p-6 bg-white/40 border border-rose-200">
          <p className="text-sm leading-7 text-rose-900">
            I&apos;m not a beauty expert. For years I bought the &ldquo;right&rdquo; products and still felt like makeup looked wrong on me — too heavy, too orange, somehow disconnected. Maya came out of trying to understand why. The more I dug in, the more I realized it was never about buying more — it was about harmony, and about finally seeing my own face clearly.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-rose-500">
            — Adi, founder
          </p>
        </div>

        {/* Founder video placeholder */}
        <div className="mt-4 overflow-hidden rounded-2xl bg-white/30 border border-rose-200">
          <div className="relative flex aspect-video items-center justify-center">
            <PlayIcon />
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-rose-500">
              Why I built Maya
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

      </div>
    </main>
  );
}

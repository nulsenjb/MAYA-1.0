import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-3xl font-light tracking-[0.22em] uppercase text-neutral-900">
            MAYA
          </div>
        </div>
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-500">
          Personalized beauty, style, and harmony
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Unlock the magic already inside you.
        </h1>
        <p className="mt-6 text-lg leading-8 text-neutral-600">
          Discover the colors, combinations, and techniques that bring your features into harmony — personalized to your undertone, contrast, wardrobe, and the products you already own.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/signup"
            className="w-full rounded-2xl bg-black px-5 py-3 text-white text-center"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="w-full rounded-2xl border px-5 py-3 text-center"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}

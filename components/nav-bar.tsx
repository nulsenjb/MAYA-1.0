'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';

export function NavBar() {
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/auth')) return null;

  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <span className="text-base font-light tracking-[0.18em] uppercase text-neutral-900">
            MAYA
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
          <Link href="/intake">Profile</Link>
          <Link href="/inventory">My Stash</Link>
          <Link href="/refine">Refine</Link>
          <Link href="/videos">Videos</Link>
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
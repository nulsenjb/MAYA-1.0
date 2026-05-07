'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { SignOutButton } from '@/components/sign-out-button';

const TABS = [
  { href: '/profile', label: 'Profile', icon: '◎' },
  { href: '/inventory', label: 'My Stash', icon: '▣' },
  { href: '/refine', label: 'Refine', icon: '↺' },
  { href: '/videos', label: 'Videos', icon: '▶' },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/intake')) return null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <>
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <span className="text-base font-light tracking-[0.18em] uppercase text-neutral-900">
              MAYA
            </span>
          </Link>
          <nav className="hidden md:flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            <Link href="/profile">Profile</Link>
            <Link href="/inventory">My Stash</Link>
            <Link href="/refine">Refine</Link>
            <Link href="/videos">Videos</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-neutral-100 flex md:hidden items-center justify-around px-2 pt-2 pb-3"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 flex-1 py-1"
            >
              <div
                className={`w-1 h-1 rounded-full mb-0.5 ${
                  active ? 'bg-neutral-900' : 'bg-transparent'
                }`}
              />
              <span
                className={`text-xl ${active ? 'text-neutral-900' : 'text-neutral-400'}`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 flex-1 py-1"
        >
          <div className="w-1 h-1 rounded-full mb-0.5 bg-transparent" />
          <span className="text-xl text-neutral-300">→</span>
          <span className="text-[10px] font-medium text-neutral-400">Sign out</span>
        </button>
      </div>
    </>
  );
}

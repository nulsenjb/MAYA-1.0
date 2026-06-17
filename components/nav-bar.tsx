'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { SignOutButton } from '@/components/sign-out-button';

const TABS = [
  { href: '/refine', label: 'Discovery', icon: '✦' },
  { href: '/dossier', label: 'Dossier', icon: '◇' },
  { href: '/looks', label: 'Lookbooks', icon: '❖' },
  { href: '/inventory', label: 'Collection', icon: '▣' },
  { href: '/videos', label: 'Learn', icon: '▶' },
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
      <header
        className="backdrop-blur"
        style={{ background: 'var(--grad-transition)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/refine">
            <span
              className="text-base font-light tracking-[0.18em] uppercase"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              MAYA
            </span>
          </Link>
          <nav
            className="hidden md:flex flex-wrap items-center gap-4 text-sm"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <Link href="/refine">Discovery</Link>
            <Link href="/dossier">Dossier</Link>
            <Link href="/looks">Lookbooks</Link>
            <Link href="/inventory">My Collection</Link>
            <Link href="/videos">Learn</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm flex md:hidden items-center justify-around px-2 pt-2 pb-3"
        style={{
          background: 'var(--grad-transition)',
          paddingBottom: 'env(safe-area-inset-bottom, 12px)',
          borderTop: '1px solid rgba(255,255,255,0.15)',
        }}
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
                className="w-1 h-1 rounded-full mb-0.5"
                style={{ backgroundColor: active ? 'rgba(255,255,255,0.97)' : 'transparent' }}
              />
              <span
                className="text-xl"
                style={{ color: active ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.45)' }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[10px] font-medium whitespace-nowrap text-center leading-tight"
                style={{ color: active ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.45)' }}
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
          <span className="text-xl" style={{ color: 'rgba(255,255,255,0.45)' }}>→</span>
          <span className="text-[10px] font-medium whitespace-nowrap text-center leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Sign out
          </span>
        </button>
      </div>
    </>
  );
}

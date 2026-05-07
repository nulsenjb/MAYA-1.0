'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
    >
      Sign out
    </button>
  );
}

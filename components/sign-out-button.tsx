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
      className="text-xs transition-colors"
      style={{ color: 'rgba(255,255,255,0.65)' }}
    >
      Sign out
    </button>
  );
}

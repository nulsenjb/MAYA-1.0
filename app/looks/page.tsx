/*
 * TODO: run in Supabase SQL editor — adds the looks table this page reads.
 *
 * CREATE TABLE looks (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users not null,
 *   name text not null,
 *   notes text,
 *   created_at timestamptz default now()
 * );
 *
 * alter table looks enable row level security;
 * create policy "looks_all_own" on looks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 */

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LooksList } from '@/components/looks-list';

type Look = {
  id: string;
  name: string;
  notes: string | null;
  created_at: string;
};

export default async function LooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  let looks: Look[] = [];
  const { data } = await supabase
    .from('looks')
    .select('id, name, notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (data) looks = data as Look[];

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
        Your looks
      </p>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Saved looks</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Name and save looks you love. Build your personal playlist of go-to combinations.
      </p>

      {looks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">✦</div>
          <h2 className="text-lg font-semibold mb-2">No looks saved yet</h2>
          <p className="text-sm text-neutral-500 max-w-xs mb-6">
            As you work with Maya, save looks you love and give them names — your everyday, your evening, your event-ready.
          </p>
          <Link
            href="/dossier"
            className="rounded-xl bg-neutral-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-neutral-700 transition-colors"
          >
            Browse your dossier →
          </Link>
        </div>
      ) : (
        <LooksList looks={looks} />
      )}
    </main>
  );
}

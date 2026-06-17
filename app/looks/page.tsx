import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ClosetView } from '@/components/closet-view';

export type SavedLook = {
  id: string;
  title: string;
  steps: string[];
  palette: string[];
  why: string;
  lookbook: string;
  created_at: string;
};

export default async function LooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data } = await supabase
    .from('saved_looks')
    .select('id, title, steps, palette, why, lookbook, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const looks: SavedLook[] = (data ?? []) as SavedLook[];

  return <ClosetView looks={looks} />;
}

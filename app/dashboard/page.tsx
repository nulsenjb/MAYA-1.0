import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-3 text-neutral-600">
        {user?.email ? `Signed in as ${user.email}` : 'Your personalized beauty workspace.'}
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/intake" className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-neutral-50">
          <h2 className="font-medium">Intake</h2>
          <p className="mt-2 text-sm text-neutral-600">Define your undertone, contrast, style goals, and frustrations.</p>
        </Link>
        <Link href="/inventory" className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-neutral-50">
          <h2 className="font-medium">Inventory</h2>
          <p className="mt-2 text-sm text-neutral-600">Track products, shades, notes, and favorites.</p>
        </Link>
        <Link href="/dossier" className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-neutral-50">
          <h2 className="font-medium">Dossier</h2>
          <p className="mt-2 text-sm text-neutral-600">Generate personalized style guidance from your data.</p>
        </Link>
        <Link href="/refine" className="rounded-3xl border bg-white p-6 shadow-sm hover:bg-neutral-50">
          <h2 className="font-medium">Refine</h2>
          <p className="mt-2 text-sm text-neutral-600">Log what worked and improve your beauty system over time.</p>
        </Link>
      </div>
    </main>
  );
}
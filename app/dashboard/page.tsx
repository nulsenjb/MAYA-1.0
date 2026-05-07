import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: intake }, { count: inventoryCount }] = await Promise.all([
    supabase
      .from('intake_profiles')
      .select('notes, complexion_depth, age_range')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  const intakeComplete = Boolean(
    intake &&
      intake.complexion_depth &&
      String(intake.complexion_depth).trim() &&
      intake.age_range &&
      String(intake.age_range).trim()
  );
  const nameMatch = intake?.notes?.match(/Name:\s*([^.]+)/);
  const firstName = nameMatch ? nameMatch[1].trim().split(' ')[0] : '';

  return (
    <DashboardClient
      intakeComplete={intakeComplete}
      firstName={firstName}
      inventoryCount={inventoryCount ?? 0}
    />
  );
}

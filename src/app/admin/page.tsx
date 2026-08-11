import { createClient } from '@/utils/supabase/server';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  // Fetch milestones with 'Funded_in_Escrow' status and sum their amounts
  const { data: fundedMilestones } = await supabase
    .from('milestones')
    .select('amount')
    .eq('status', 'Funded_in_Escrow');

  const totalGMV = (fundedMilestones ?? []).reduce(
    (sum, m) => sum + (m.amount ?? 0),
    0,
  );

  // Fetch projects currently in dispute
  const { data: disputes } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'Disputed');

  // Count completed projects
  const { count: completedCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Completed');

  return (
    <AdminDashboardClient
      totalGMV={totalGMV}
      disputes={disputes ?? []}
      completedCount={completedCount ?? 0}
    />
  );
}

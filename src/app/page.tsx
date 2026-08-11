import { createClient } from '@/utils/supabase/server';
import type { Milestone } from '@/lib/supabase';
import WorkspaceClient from '@/components/WorkspaceClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  
  // Get securely authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch role
  let userRole = 'Freelancer'; // Default fallback
  let isAdmin = false;
  if (user) {
    if (user.email === 'd.u.flash55@gmail.com') {
      isAdmin = true;
    }
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role) {
      userRole = profile.role;
    }
  }

  // Fetch milestones
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .order('created_at', { ascending: true });

  let milestones: Milestone[] = [];
  if (!error && data) {
    milestones = data;
  }

  return <WorkspaceClient initialMilestones={milestones} userRole={userRole} isAdmin={isAdmin} />;
}


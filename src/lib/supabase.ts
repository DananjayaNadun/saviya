import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Define Types based on the planned schema
export type Role = 'Client_SME' | 'Freelancer';
export type ProjectStatus = 'Draft' | 'Active' | 'Completed' | 'Disputed';
export type MilestoneStatus = 'Unfunded' | 'Funded_in_Escrow' | 'Approved' | 'Paid_Out';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  freelancer_id: string;
  title: string;
  total_budget: number;
  status: ProjectStatus;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  milestone_name: string;
  amount: number; // LKR
  status: MilestoneStatus;
  created_at: string;
  updated_at: string;
}

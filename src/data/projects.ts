export interface Milestone {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  amount?: number;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  status: string;
  budget: string;
  deadline: string;
  clientName: string;
  description?: string;
  progress: number;
  proposals?: ProjectProposal[];
  milestones?: Milestone[];
  service_type?: 'editing_only' | 'editing_and_shoot';
  location_mode?: 'anywhere_india' | 'preferred_location' | 'shoot_location';
  latitude?: number;
  longitude?: number;
  shoot_radius_km?: number;
  locations?: { name: string; lat: number; lng: number }[];
  priority_project?: boolean;
  created_at?: string;
  updated_at?: string;
  client_id: string;
  assigned_creator_id?: string;
  city?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  client?: { id: string; full_name: string; email: string; avatar_url?: string };
  assigned_creator?: { id: string; full_name: string; email: string; specialization?: string; avatar_url?: string };
  accepted_proposal?: ProjectProposal;
  current_stage?: 'briefing' | 'kickoff' | 'production' | 'review' | 'delivery' | 'completed';
}

export interface ProjectProposal {
  id: string;
  creatorName: string;
  creatorImage: string;
  price: string;
  amount?: string;
  aiScore: number;
  message: string;
  daysToComplete?: number;
  category?: string;
  status?: string;
  cover_letter?: string;
  proposed_budget?: number;
  estimated_days?: number;
}

export const projects: Project[] = [];
export const mockProjects: Project[] = [];

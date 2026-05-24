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
  proposals?: any[];
  milestones?: any[];
  service_type?: 'editing_only' | 'editing_and_shoot';
  location_mode?: 'anywhere_india' | 'preferred_location' | 'shoot_location';
  latitude?: number;
  longitude?: number;
  shoot_radius_km?: number;
  locations?: { name: string; lat: number; lng: number }[];
  priority_project?: boolean;
}

export interface ProjectProposal {
  id: string;
  creatorName: string;
  creatorImage: string;
  rating: number;
  price: string;
  amount?: string;
  aiScore: number;
  message: string;
  daysToComplete?: number;
  category?: string;
  status?: string;
}

export const projects: Project[] = [];
export const mockProjects: Project[] = [];

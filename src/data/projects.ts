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
  locations?: { name: string; lat: number; lng: number }[];
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

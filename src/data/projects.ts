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

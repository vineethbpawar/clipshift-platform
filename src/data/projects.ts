import { type Creator } from "./creators";

export type ProjectStatus = "Pending" | "In Progress" | "Review" | "Completed";

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
}

export interface ProjectProposal {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  amount: string;
  message: string;
  daysToComplete: number;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  status: ProjectStatus;
  deadline: string;
  budget: string;
  clientName: string;
  milestones: Milestone[];
  proposals: ProjectProposal[];
}

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    title: "Cyberpunk Fan Edit - 4K",
    category: "Cinematic Reels",
    status: "In Progress",
    deadline: "2026-06-15T00:00:00Z",
    budget: "$500 - $800",
    clientName: "Arasaka Media",
    milestones: [
      { id: "m1", title: "Footage Assembly", completed: true, date: "2026-05-08" },
      { id: "m2", title: "VFX & Compositing", completed: false },
      { id: "m3", title: "Color Grade", completed: false },
      { id: "m4", title: "Final Delivery", completed: false },
    ],
    proposals: []
  },
  {
    id: "proj-2",
    title: "Mountain Drone Shoot",
    category: "Drone",
    status: "Pending",
    deadline: "2026-06-20T00:00:00Z",
    budget: "$1200",
    clientName: "EcoTravel Co.",
    milestones: [],
    proposals: [
      {
        id: "prop-1",
        creatorId: "2",
        creatorName: "Sarah Cinematic",
        creatorImage: "https://i.pravatar.cc/150?u=sarah",
        amount: "$1100",
        message: "I have 5 years of experience with heavy lifting drones. Can deliver in 48h after the shoot.",
        daysToComplete: 2
      },
      {
        id: "prop-2",
        creatorId: "6",
        creatorName: "Leo Reels",
        creatorImage: "https://i.pravatar.cc/150?u=leo",
        amount: "$950",
        message: "Specialist in high-speed FPV mountain chasing. Check my latest portfolio reels.",
        daysToComplete: 3
      }
    ]
  }
];

export type CreatorCategory = 
  | "Wedding" 
  | "Pre-Wedding" 
  | "Cinematic Reels" 
  | "YouTube" 
  | "Commercial Ads" 
  | "Drone" 
  | "Event Coverage" 
  | "Fashion" 
  | "Music Video" 
  | "Podcast" 
  | "Gaming" 
  | "Corporate Production";

export type CreatorLevel = "Beginner" | "Standard" | "Professional" | "Premium";

export interface Creator {
  id: string;
  name: string;
  role: string;
  category: string;
  image: string;
  rating: number;
  price: string;
  verified: boolean;
  level?: CreatorLevel;
  city: string;
  area: string;
  delivery: string;
  videoPreview?: string;
  aiScore?: number;
  rank_score?: number;
  plan_type?: string;
  completed_projects?: number;
  instagram?: string;
  portfolio_link?: string;
  bio?: string;
  specialty?: string[];
  location: {
    lat: number;
    lng: number;
    city?: string;
    area?: string;
    pincode?: string;
  };
}

export const creators: Creator[] = [];

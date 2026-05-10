export type CreatorCategory = 
  | "Wedding" | "Pre-Wedding" | "Cinematic Reels" | "YouTube" 
  | "Commercial Ads" | "Drone" | "Event Coverage" | "Fashion" 
  | "Music Video" | "Podcast" | "Gaming" | "Corporate Production";

export type CreatorLevel = "Beginner" | "Standard" | "Professional" | "Premium";

export interface Creator {
  id: string;
  name: string;
  category: CreatorCategory;
  level: CreatorLevel;
  rating: number;
  price: string;
  image: string;
  videoPreview: string;
  deliverySpeed: string;
  verified: boolean;
  aiScore: number;
  location: {
    lat: number;
    lng: number;
    city: string;
    area: string;
    pincode: string;
  };
  specialty: string[];
}

export const creators: Creator[] = [
  {
    id: "1",
    name: "Alex Maverick",
    category: "Cinematic Reels",
    level: "Premium",
    rating: 4.9,
    price: "$50",
    image: "https://i.pravatar.cc/150?u=alex",
    videoPreview: "https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4",
    deliverySpeed: "24h",
    verified: true,
    aiScore: 98,
    location: {
      lat: 19.0760,
      lng: 72.8777,
      city: "Mumbai",
      area: "Bandra",
      pincode: "400050",
    },
    specialty: ["VFX", "Color Grading", "Narrative"],
  },
  {
    id: "2",
    name: "Sarah Cinematic",
    category: "Drone",
    level: "Professional",
    rating: 5.0,
    price: "$120",
    image: "https://i.pravatar.cc/150?u=sarah",
    videoPreview: "https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-fast-car-in-the-desert-23425-large.mp4",
    deliverySpeed: "48h",
    verified: true,
    aiScore: 95,
    location: {
      lat: 19.1136,
      lng: 72.8697,
      city: "Mumbai",
      area: "Andheri",
      pincode: "400053",
    },
    specialty: ["4K RAW", "Drone", "Commercial"],
  },
  {
    id: "3",
    name: "Marcus Cut",
    category: "Wedding",
    level: "Standard",
    rating: 4.7,
    price: "$45",
    image: "https://i.pravatar.cc/150?u=marcus",
    videoPreview: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-4113-large.mp4",
    deliverySpeed: "3-5 days",
    verified: false,
    aiScore: 88,
    location: {
      lat: 18.9220,
      lng: 72.8347,
      city: "Mumbai",
      area: "Colaba",
      pincode: "400001",
    },
    specialty: ["Music Videos", "Social Media"],
  },
  {
    id: "4",
    name: "Elena Vision",
    category: "Fashion",
    level: "Premium",
    rating: 4.8,
    price: "$150",
    image: "https://i.pravatar.cc/150?u=elena",
    videoPreview: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lights-1235-large.mp4",
    deliverySpeed: "2 days",
    verified: true,
    aiScore: 92,
    location: {
      lat: 19.0178,
      lng: 72.8478,
      city: "Mumbai",
      area: "Dadar",
      pincode: "400014",
    },
    specialty: ["Documentary", "Wedding Cinematic"],
  },
  {
    id: "5",
    name: "David Post",
    category: "Corporate Production",
    level: "Beginner",
    rating: 4.6,
    price: "$60",
    image: "https://i.pravatar.cc/150?u=david",
    videoPreview: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-laptop-34440-large.mp4",
    deliverySpeed: "24h",
    verified: false,
    aiScore: 85,
    location: {
      lat: 19.2183,
      lng: 72.9781,
      city: "Thane",
      area: "Wagle Estate",
      pincode: "400604",
    },
    specialty: ["3D Animation", "Motion Graphics"],
  },
  {
    id: "6",
    name: "Leo Reels",
    category: "Cinematic Reels",
    level: "Standard",
    rating: 4.9,
    price: "$30",
    image: "https://i.pravatar.cc/150?u=leo",
    videoPreview: "https://assets.mixkit.co/videos/preview/mixkit-fast-cars-drifting-on-a-racetrack-42792-large.mp4",
    deliverySpeed: "12h",
    verified: true,
    aiScore: 99,
    location: {
      lat: 19.0330,
      lng: 73.0297,
      city: "Navi Mumbai",
      area: "Vashi",
      pincode: "400703",
    },
    specialty: ["iPhone Pro", "Insta360", "Fast Cuts"],
  }
];

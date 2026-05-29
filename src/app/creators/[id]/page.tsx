"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { supabase } from "@/lib/supabase";
import { 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  ExternalLink, 
  ArrowLeft, 
  Loader2, 
  Play, 
  Camera, 
  Globe,
  Award,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UnlockModal } from "@/components/monetization/UnlockModal";
import { motion, AnimatePresence } from "framer-motion";
import { type Creator } from "@/data/creators";

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, unlockedCreators } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCreator = async () => {
      const { data, error } = await supabase
        .from('creators')
        .select(`
          *,
          profiles(*)
        `)
        .eq('id', params.id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setCreator({
          ...data,
          name: data.profiles.full_name,
          image: data.profiles.avatar_url,
          verified: data.verified_creator,
          specialty: data.specialization ? [data.specialization] : [],
          rating: data.rating || 4.9,
          price: (data.starting_price || 499).toString(),
          city: data.profiles.city || "Remote",
          area: data.profiles.area || "",
          role: "creator",
          delivery: "3-5 Days",
          location: {
            lat: data.location_lat,
            lng: data.location_lng,
            city: data.profiles.city
          }
        });
      }
      setLoading(false);
    };
    fetchCreator();
  }, [params.id]);

  const isUnlocked = unlockedCreators.includes(params.id as string);

  if (loading) return <div className="flex justify-center pt-40"><Loader2 className="animate-spin text-neon-purple" size={48} /></div>;
  if (notFound || !creator) return (
    <div className="text-center pt-40 px-6 italic font-black uppercase text-gray-500 tracking-[0.4em]">
       Account Not Found
    </div>
  );

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto pt-32 pb-32 px-6 sm:px-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-10 text-[10px] uppercase tracking-[0.2em] font-black transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Creators
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left: Profile Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass p-10 rounded-[50px] border-white/5 bg-white/[0.01] relative overflow-hidden text-center">
              <div className="relative inline-block mb-8">
                 <div className="w-40 h-40 rounded-[50px] overflow-hidden glass border-2 border-neon-purple/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                   <img src={creator.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="" />
                 </div>
                 {creator.verified && (
                   <div className="absolute -bottom-2 -right-2 p-3 bg-neon-blue rounded-2xl shadow-xl border-4 border-black">
                     <ShieldCheck size={24} className="text-white" />
                   </div>
                 )}
              </div>

              <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">{creator.name}</h1>
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{creator.category}</span>
                <div className="w-1 h-1 rounded-full bg-gray-700" />
                <span className="text-[10px] text-neon-blue font-black uppercase tracking-widest">{creator.level || 'Professional'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="p-5 glass rounded-3xl border-white/5 bg-black/20">
                    <div className="flex items-center justify-center gap-1.5 mb-1 text-yellow-500">
                       <Star size={12} className="fill-current" />
                       <span className="text-sm font-black text-white">{creator.rating}</span>
                    </div>
                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Global Rating</p>
                 </div>
                 <div className="p-5 glass rounded-3xl border-white/5 bg-black/20">
                    <p className="text-sm font-black text-white mb-1 italic">{(creator as any).completed_projects || 0}</p>
                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Projects Done</p>
                 </div>
              </div>

              {user?.id !== creator.id && user?.role === 'client' && (
                <button 
                  onClick={() => isUnlocked ? router.push(`/chat/${params.id}`) : setIsModalOpen(true)}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 ${isUnlocked ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-neon-purple hover:text-white'}`}
                >
                  <MessageSquare size={18} />
                  {isUnlocked ? "Send Message" : "Unlock Contact Access"}
                </button>
              )}
            </div>

            <div className="glass p-8 rounded-[40px] border-white/5 space-y-6">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 italic">Connect</h3>
               <div className="space-y-3">
                  {(creator as any).instagram && (
                    <a href={`https://instagram.com/${(creator as any).instagram}`} target="_blank" className="flex items-center justify-between p-4 glass rounded-2xl border-white/5 hover:bg-white/5 transition-all group">
                       <div className="flex items-center gap-3">
                          <Camera size={18} className="text-pink-500" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Instagram</span>
                       </div>
                       <ExternalLink size={14} className="text-gray-700 group-hover:text-white transition-colors" />
                    </a>
                  )}
                  {(creator as any).portfolio_link && (
                    <a href={(creator as any).portfolio_link} target="_blank" className="flex items-center justify-between p-4 glass rounded-2xl border-white/5 hover:bg-white/5 transition-all group">
                       <div className="flex items-center gap-3">
                          <Briefcase size={18} className="text-neon-blue" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">External Portfolio</span>
                       </div>
                       <ExternalLink size={14} className="text-gray-700 group-hover:text-white transition-colors" />
                    </a>
                  )}
               </div>
            </div>
          </div>

          {/* Right: Portfolio & Bio */}
          <div className="lg:col-span-2 space-y-10">
            <div className="glass p-10 sm:p-14 rounded-[50px] border-white/5 bg-white/[0.01] relative overflow-hidden">
               <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 italic flex items-center gap-3">
                 <Globe size={18} className="text-neon-purple" /> Professional Biography
               </h2>
               <p className="text-gray-300 text-lg leading-relaxed uppercase tracking-wider font-medium opacity-80 mb-10 italic">
                 &quot;{(creator as any).bio || "No professional biography provided yet. This creator is verified for visual excellence."}&quot;
               </p>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Starting Price</span>
                    <p className="text-base font-black text-white">₹{creator.price}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Base City</span>
                    <p className="text-base font-black text-white uppercase italic">{creator.city}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Experience</span>
                    <p className="text-base font-black text-white">3+ Years</p>
                  </div>
               </div>
               <div className="absolute -right-20 -top-20 w-80 h-80 bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />
            </div>

            <div className="space-y-8">
               <div className="flex items-center justify-between mb-2 px-4">
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] italic flex items-center gap-3">
                    <Award size={18} className="text-yellow-500" /> Featured Showcase
                  </h2>
               </div>
               
               {/* Grid for showcase */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="aspect-video glass rounded-[32px] border-white/5 overflow-hidden group relative bg-black/40">
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/60 backdrop-blur-sm z-10">
                          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:scale-110 transition-transform cursor-pointer">
                             <Play fill="white" className="text-white" size={24} />
                          </div>
                       </div>
                       <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20">
                          <ImageIcon size={40} className="text-gray-700" />
                          <p className="text-[8px] font-black uppercase tracking-widest">Cinematic Asset {i}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <UnlockModal 
            creator={creator} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

const ImageIcon = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

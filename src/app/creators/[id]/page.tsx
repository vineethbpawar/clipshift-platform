"use client";

import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { 
  Zap, Star, Award, ShieldCheck, MapPin, 
  MessageSquare, Globe, ArrowLeft, Loader2, Sparkles,
  Camera, Film, Play, CheckCircle2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { calculateCreatorRank, type CreatorProfile } from "@/lib/creators";
import { UnlockModal } from "@/components/monetization/UnlockModal";
import { motion } from "framer-motion";

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!params.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        
        if (data) {
          const rank = calculateCreatorRank(data as CreatorProfile);
          setCreator({ ...data, rank_score: rank });

          // Check if unlocked
          if (user?.role === 'client') {
            const { data: unlock } = await supabase
              .from('creator_unlocks')
              .select('*')
              .eq('client_id', user.id)
              .eq('creator_id', params.id)
              .maybeSingle();
            setIsUnlocked(!!unlock);
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.id, user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-neon-purple" size={48} />
    </div>
  );

  if (!creator) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <h2 className="text-2xl font-black uppercase mb-4 tracking-widest">Node Not Found</h2>
      <button onClick={() => router.back()} className="px-8 py-3 glass rounded-full text-xs font-bold uppercase tracking-widest">Return to Collective</button>
    </div>
  );

  const isOwnProfile = user?.id === creator.id;

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-12 text-[10px] font-black uppercase tracking-[0.2em] transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Discovery
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Identity Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-purple to-neon-blue" />
              
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
                <div className="absolute inset-0 bg-neon-purple/20 blur-3xl rounded-full animate-pulse" />
                <img 
                  src={creator.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} 
                  className="w-full h-full object-cover rounded-[32px] border-2 border-white/10 relative z-10"
                  alt={creator.full_name}
                />
                {creator.verified_creator && (
                  <div className="absolute -bottom-2 -right-2 bg-neon-blue p-2 rounded-xl z-20 shadow-lg">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                )}
              </div>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{creator.full_name}</h1>
                <div className="flex items-center justify-center gap-2 mb-4">
                   <span className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[8px] font-black text-neon-purple uppercase tracking-widest">
                     {creator.specialization || "Creative"}
                   </span>
                   <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                     {creator.tier || "Beginner"}
                   </span>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {creator.rating || 0}</div>
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  <div className="flex items-center gap-1"><Award size={14} className="text-neon-blue" /> {creator.completed_projects || 0} Projects</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Node Rank</div>
                  <div className="text-xl font-black text-white flex items-center gap-2">
                    <Zap size={16} className="text-neon-blue fill-neon-blue" />
                    {creator.rank_score}
                  </div>
                </div>

                {!isOwnProfile && (
                  <button 
                    onClick={() => isUnlocked ? router.push(`/chat/${creator.id}`) : setIsModalOpen(true)}
                    className="w-full py-4 rounded-2xl bg-neon-purple text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    {isUnlocked ? "Open Communication" : "Unlock Node Access"}
                  </button>
                )}
                
                {isOwnProfile && (
                  <button onClick={() => router.push('/settings')} className="w-full py-4 rounded-2xl glass border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
                    Edit Profile Node
                  </button>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border-white/5 space-y-6">
              <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-neon-blue" />
                Network Coordinates
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Location</span>
                  <span className="text-white">{creator.city || "Global Node"}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Experience</span>
                  <span className="text-white">{creator.tier || "Standard"}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Availability</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Portfolio & Info */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <Film size={18} className="text-neon-purple" />
                Mission Brief / Bio
              </h3>
              <div className="glass p-8 rounded-[40px] border-white/5">
                <p className="text-gray-400 leading-relaxed text-sm md:text-base italic">
                  "{creator.bio || "This cinematic creator has not yet defined their mission brief. Proceeding with standard creative protocols."}"
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <Camera size={18} className="text-neon-blue" />
                  Cinematic Reel
                </h3>
                {creator.portfolio_link && (
                  <a 
                    href={creator.portfolio_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-neon-purple uppercase tracking-widest hover:underline"
                  >
                    External Link
                  </a>
                )}
              </div>
              
              <div className="aspect-video glass rounded-[40px] border-white/5 overflow-hidden group relative flex items-center justify-center">
                {creator.portfolio_link ? (
                  <div className="text-center p-12">
                    <Play size={48} className="text-white/20 mx-auto mb-4" />
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">External Portfolio Node Detected</p>
                    <a href={creator.portfolio_link} target="_blank" className="mt-6 inline-block px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-full">Access Reel</a>
                  </div>
                ) : (
                  <div className="text-center p-12 opacity-30">
                    <Film size={48} className="mx-auto mb-4" />
                    <p className="text-[10px] uppercase font-black tracking-widest">No cinematic reel synchronized yet.</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <Sparkles size={18} className="text-neon-purple" />
                Specializations
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(creator.languages || ["English", "Hindi"]).map((tag: string, i: number) => (
                  <div key={i} className="glass p-4 rounded-2xl border-white/5 flex items-center gap-3 group hover:border-neon-blue/50 transition-colors">
                    <CheckCircle2 size={14} className="text-neon-blue" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{tag}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <UnlockModal 
        creator={creator} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </PageWrapper>
  );
}

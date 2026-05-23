"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShieldCheck, Zap, MapPin, Play, MessageSquare, Sparkles, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UnlockModal } from "../monetization/UnlockModal";
import { UnlockBadge } from "../monetization/UnlockBadge";
import { useRouter } from "next/navigation";

export const CreatorCard = ({ creator }: { creator: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  // In a real app, this would come from a database check in AuthContext or parent
  const isUnlocked = false; 

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnlocked) {
      router.push(`/chat/${creator.id}`);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -5 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative glass border-white/5 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-neon-purple/50"
      >
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="glass px-3 py-1.5 rounded-full border-neon-blue/30 flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Zap size={12} className="text-neon-blue fill-neon-blue" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Rank: {creator.rank_score || 0}</span>
          </div>
          
          {creator.plan_type === 'creator_premium' && (
            <div className="glass px-3 py-1.5 rounded-full border-neon-purple/30 flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Sparkles size={10} className="text-neon-purple" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Premium</span>
            </div>
          )}

          {creator.completed_projects >= 20 && (
             <div className="glass px-3 py-1.5 rounded-full border-green-500/30 flex items-center gap-2">
               <Award size={10} className="text-green-500" />
               <span className="text-[8px] font-black text-white uppercase tracking-widest">Top Rated</span>
             </div>
          )}

          {isUnlocked && <UnlockBadge />}
        </div>

        {/* Rank Progress Bar (Visual) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${creator.rank_score || 0}%` }}
            className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
          />
        </div>

        {/* Image / Video Preview Section */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={creator.image}
            alt={creator.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-110 blur-sm opacity-30" : "scale-100"}`}
          />
          
          {/* Muted Video Preview */}
          <video
            ref={videoRef}
            src={creator.videoPreview}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
          />

          {!isHovered && (
            <div className="absolute bottom-4 right-4 text-white/50">
              <Play size={20} className="fill-white/20" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        </div>

        {/* Content Section */}
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white tracking-tighter uppercase">{creator.full_name || creator.name}</h3>
              {creator.verified_creator && <ShieldCheck size={18} className="text-neon-blue" />}
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-white">{creator.rating || 0}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[9px] font-black text-neon-purple uppercase tracking-widest">
              {creator.specialization || creator.category || "Creative"}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              {creator.tier || 'Beginner'}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-auto">
              <MapPin size={12} />
              {creator.city || 'Remote Node'}
            </span>
          </div>

          <p className="text-[10px] text-gray-400 line-clamp-2 mb-6 uppercase tracking-widest font-medium opacity-60">
            {creator.bio || "No mission brief provided by this cinematic node."}
          </p>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Fee Structure</div>
              <div className="text-2xl font-black text-white">{creator.price || `₹${creator.starting_price || 0}`}<span className="text-xs text-gray-500 font-normal">/project</span></div>
            </div>
            {user?.role === 'client' && (
              <button
                onClick={handleChat}
                className="px-6 py-3 rounded-xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-transform"
              >
                <MessageSquare size={14} />
                {isUnlocked ? "Signal Node" : "Unlock Node"}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <UnlockModal 
            creator={creator} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

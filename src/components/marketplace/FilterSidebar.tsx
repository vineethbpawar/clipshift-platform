"use client";

import React from "react";
import { Filter, Star, Zap, Award, Target, SortDesc } from "lucide-react";

interface FilterSidebarProps {
  selectedSpecialization: string;
  setSelectedSpecialization: (s: string) => void;
  selectedTier: string;
  setSelectedTier: (t: string) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}

export const FilterSidebar = ({
  selectedSpecialization,
  setSelectedSpecialization,
  selectedTier,
  setSelectedTier,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
}: FilterSidebarProps) => {
  
  return (
    <div className="w-full md:w-72 space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
          <Filter size={16} className="text-neon-purple" />
          Filter Node
        </h3>
        <button 
          onClick={() => {
            setSelectedSpecialization("");
            setSelectedTier("");
            setMinRating(0);
            setSortBy("rank");
          }}
          className="text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-widest transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Sort By */}
      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
        <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] flex items-center gap-2">
          <SortDesc size={12} className="text-neon-blue" />
          Sort Protocol
        </h4>
        <div className="space-y-2">
          {[
            { id: 'rank', label: 'Recommended Rank', icon: Target },
            { id: 'rating', label: 'Quality Rating', icon: Star },
            { id: 'completed', label: 'Projects Completed', icon: Award },
            { id: 'newest', label: 'Latest Nodes', icon: Zap },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSortBy(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                sortBy === item.id 
                  ? "bg-neon-purple/20 border-neon-purple text-white" 
                  : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Specialization */}
      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
        <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Specialization</h4>
        <div className="grid grid-cols-1 gap-2">
          {['editing', 'videography', 'both'].map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(selectedSpecialization === spec ? "" : spec)}
              className={`text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                selectedSpecialization === spec 
                  ? "bg-neon-blue/20 border-neon-blue text-white" 
                  : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
              }`}
            >
              {spec === 'both' ? 'Editing + Shooting' : spec}
            </button>
          ))}
        </div>
      </div>

      {/* Tier */}
      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
        <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Experience Tier</h4>
        <div className="grid grid-cols-1 gap-2">
          {['beginner', 'professional', 'premium'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(selectedTier === tier ? "" : tier)}
              className={`text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                selectedTier === tier 
                  ? "bg-neon-purple/20 border-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                  : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
        <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Minimum Quality</h4>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all border ${
                minRating === r 
                  ? "bg-white text-black border-white" 
                  : "bg-white/5 border-transparent text-gray-500 hover:border-white/10"
              }`}
            >
              {r === 0 ? "ALL" : `${r}+`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

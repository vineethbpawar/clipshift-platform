"use client";

import React from "react";
import { motion } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
import { type CreatorCategory } from "@/data/creators";

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}

export const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
}: FilterSidebarProps) => {
  const categories: CreatorCategory[] = [
    "Wedding", "Pre-Wedding", "Cinematic Reels", "YouTube", 
    "Commercial Ads", "Drone", "Event Coverage", "Fashion", 
    "Music Video", "Podcast", "Gaming", "Corporate Production"
  ];

  return (
    <div className="w-full md:w-72 flex-shrink-0 space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <Filter size={16} className="text-neon-purple" />
            Filters
          </h3>
          <button 
            onClick={() => {
              setSelectedCategory("");
              setPriceRange([0, 1000]);
            }}
            className="text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-widest transition-colors"
          >
            Reset All
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-10">
          <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-4">Categories</h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                  selectedCategory === cat 
                    ? "bg-neon-purple/20 border-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                    : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-10">
          <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-4">Price Range</h4>
          <input 
            type="range" 
            min="0" 
            max="1000" 
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-purple"
          />
          <div className="flex justify-between mt-3 text-[10px] font-mono text-gray-400">
            <span>$0</span>
            <span className="text-white font-bold">${priceRange[1]}</span>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-4">Minimum Rating</h4>
          <div className="flex gap-2">
            {[3, 4, 5].map((r) => (
              <button
                key={r}
                className="flex-1 py-2 bg-white/5 border border-transparent rounded-lg text-xs font-bold text-gray-400 hover:border-white/10 transition-all"
              >
                {r}+ ★
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

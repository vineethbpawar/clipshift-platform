"use client";

import React from "react";
import { 
  Search, 
  Zap, 
  Star, 
  TrendingUp, 
  ShieldCheck,
  Filter,
  X
} from "lucide-react";

interface Filters {
  search: string;
  category: string;
  sortBy: string;
  verifiedOnly: boolean;
}

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClose?: () => void;
}

export const FilterSidebar = ({ filters, setFilters, onClose }: FilterSidebarProps) => {
  const categories = ["Visual Editing", "Cinematography", "VFX & Motion", "Color Grading", "Sound Design"];
  const sortOptions = [
    { id: 'popular', label: 'Top Rated', icon: Star },
    { id: 'newest', label: 'Newest Creators', icon: Zap },
    { id: 'price_low', label: 'Price: Low to High', icon: TrendingUp },
    { id: 'price_high', label: 'Price: High to Low', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col h-full space-y-10">
      <div className="flex items-center justify-between lg:hidden px-2">
         <h2 className="text-xl font-black text-white uppercase italic">Filters</h2>
         <button onClick={onClose} className="p-2 glass rounded-xl"><X size={20} /></button>
      </div>

      {/* Search */}
      <div className="space-y-4">
        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
           <Search size={12} /> Search Name
        </label>
        <div className="relative group">
          <input 
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            placeholder="Search creators..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-neon-purple transition-all italic"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
           <Filter size={12} /> Category
        </label>
        <div className="grid grid-cols-1 gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters({...filters, category: filters.category === cat ? '' : cat})}
              className={`text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filters.category === cat 
                ? "bg-neon-purple text-white border-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
                : "glass border-white/5 text-gray-500 hover:text-white hover:border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting */}
      <div className="space-y-6">
        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
           <TrendingUp size={12} /> Sort By
        </label>
        <div className="space-y-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilters({...filters, sortBy: opt.id})}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filters.sortBy === opt.id 
                ? "bg-white text-black border-white shadow-xl" 
                : "glass border-white/5 text-gray-500 hover:text-white hover:border-white/10"
              }`}
            >
              <opt.icon size={14} className={filters.sortBy === opt.id ? "text-neon-purple" : "text-gray-600"} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Only */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={() => setFilters({...filters, verifiedOnly: !filters.verifiedOnly})}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all border ${
            filters.verifiedOnly 
            ? "bg-neon-blue/10 border-neon-blue text-neon-blue" 
            : "glass border-white/5 text-gray-500"
          }`}
        >
          <div className="flex items-center gap-3">
             <ShieldCheck size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">Verified Only</span>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 border-current flex items-center justify-center`}>
             {filters.verifiedOnly && <div className="w-2 h-2 rounded-full bg-current" />}
          </div>
        </button>
      </div>

      {/* Clear Filters */}
      <button 
        onClick={() => setFilters({ search: '', category: '', sortBy: 'popular', verifiedOnly: false })}
        className="w-full py-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] hover:text-white transition-colors border border-dashed border-white/10 rounded-2xl mt-auto"
      >
        Reset Filters
      </button>
    </div>
  );
};

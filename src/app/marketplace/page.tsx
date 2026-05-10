"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { creators, type Creator } from "@/data/creators";
import { CreatorCard } from "@/components/marketplace/CreatorCard";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { FeaturedRow } from "@/components/marketplace/FeaturedRow";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LayoutGrid, Map as MapIcon, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function MarketplacePage() {
  const [view, setView] = useState<"grid" | "map">("grid");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const filteredCreators = useMemo(() => {
    return creators.filter(c => {
      const matchesCategory = selectedCategory === "" || c.category === selectedCategory;
      const priceNum = parseInt(c.price.replace("$", ""));
      const matchesPrice = priceNum <= priceRange[1];
      return matchesCategory && matchesPrice;
    });
  }, [selectedCategory, priceRange]);

  const featuredCreators = creators.filter(c => c.verified).slice(0, 4);
  const trendingCreators = creators.sort((a, b) => b.aiScore - a.aiScore).slice(0, 3);

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
              Discover <span className="text-gradient">Elite Talent</span>
            </h1>
            <p className="text-gray-400 text-lg">
              The collective of world-class cinematic creators, vetted by AI and trusted by industry leaders.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 self-start">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                view === "grid" ? "bg-neon-purple text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <LayoutGrid size={16} />
              Grid View
            </button>
            <Link href="/explore">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-all"
              >
                <MapIcon size={16} />
                Map View
              </button>
            </Link>
          </div>
        </div>

        {/* Featured Section */}
        <FeaturedRow creators={featuredCreators} />

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <FilterSidebar 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />

          {/* Grid Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-blue/10 rounded-lg text-neon-blue">
                  <Sparkles size={16} />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                  Recommended for you
                </h2>
              </div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                Showing {filteredCreators.length} results
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredCreators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </AnimatePresence>
            </div>

            {filteredCreators.length === 0 && (
              <div className="py-20 text-center glass rounded-3xl border-white/5">
                <div className="text-gray-600 mb-4 font-black uppercase tracking-[0.2em]">No Creators Found</div>
                <p className="text-gray-500 text-sm">Try adjusting your filters or radius.</p>
              </div>
            )}
          </div>

          {/* Trending Panel (Right side or bottom on mobile) */}
          <div className="w-full md:w-64 space-y-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-neon-blue" />
              <h3 className="text-white font-black uppercase tracking-widest text-sm">Trending</h3>
            </div>
            
            <div className="space-y-4">
              {trendingCreators.map((c) => (
                <div key={c.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl overflow-hidden glass border border-white/10 shrink-0">
                    <img src={c.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-neon-purple transition-colors">{c.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{c.category}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="glass p-6 rounded-3xl border-white/5 mt-12">
              <div className="text-[10px] text-neon-blue font-black uppercase tracking-widest mb-2">Pro Tip</div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Creators with the <ShieldCheck size={8} className="inline" /> badge have passed our rigorous 100-point cinematic quality check.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

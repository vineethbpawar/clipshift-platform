"use client";

import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CreatorCard } from "@/components/marketplace/CreatorCard";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { 
  Users, 
  Search, 
  Filter, 
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { type Creator } from "@/data/creators";

export default function MarketplacePage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'popular',
    verifiedOnly: false
  });

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('creators')
          .select(`
            *,
            profiles!inner(full_name, avatar_url, city, area, bio, role)
          `);

        if (filters.search) {
          query = query.ilike('profiles.full_name', `%${filters.search}%`);
        }

        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        if (filters.verifiedOnly) {
          query = query.eq('verified_creator', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          const mapped = data.map((c: any) => ({
            id: c.id,
            name: c.profiles.full_name,
            image: c.profiles.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80",
            category: c.category,
            specialization: c.specialization,
            rating: c.rating || 4.9,
            price: (c.starting_price || 499).toString(),
            city: c.profiles.city || "Remote",
            area: c.profiles.area || "",
            bio: c.profiles.bio,
            verified: c.verified_creator || false,
            rank_score: c.rank_score || 85,
            plan_type: c.plan_type,
            completed_projects: c.completed_projects || 0,
            role: "creator",
            delivery: "3-5 Days",
            location: {
              lat: c.location_lat,
              lng: c.location_lng,
              city: c.profiles.city
            }
          }));

          // Manual Sort for demo (Popularity based on projects/rating)
          if (filters.sortBy === 'popular') {
            mapped.sort((a, b) => (b.completed_projects * b.rating) - (a.completed_projects * a.rating));
          }

          setCreators(mapped as Creator[]);
        }
      } catch (err) {
        console.error("Marketplace fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [filters]);

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-32 px-6 sm:px-10 max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-neon-purple/10 rounded-xl text-neon-purple border border-neon-purple/20">
                <Users size={20} />
              </div>
              <h1 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Talent Marketplace</h1>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
              Hire Elite <span className="text-neon-purple italic">Creators</span>
            </h2>
            <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold leading-relaxed max-w-md opacity-60">
              Browse world-class editors, videographers and visual artists vetted for cinematic excellence.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <button 
               onClick={() => setShowMobileFilters(true)}
               className="lg:hidden flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl glass border-white/10 text-white font-black uppercase text-[10px] tracking-widest active:scale-95"
             >
               <Filter size={18} /> Filters
             </button>
             <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-full glass border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                <Target size={12} className="text-neon-blue" /> {creators.length} Professional Creators Online
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block sticky top-32">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </aside>

          {/* Main Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="py-40 flex flex-col items-center gap-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-white/5 border-t-neon-purple animate-spin" />
                  <Users className="absolute inset-0 m-auto text-neon-purple/40" size={32} />
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse italic">Synchronizing Marketplace</span>
              </div>
            ) : creators.length === 0 ? (
              <div className="py-40 text-center glass rounded-[50px] border-white/5 bg-white/[0.01]">
                 <Search size={48} className="mx-auto text-gray-800 mb-6" />
                 <h3 className="text-2xl font-black text-white uppercase mb-4 italic">No creators found</h3>
                 <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Try adjusting your filters to find more talent.</p>
                 <button 
                  onClick={() => setFilters({ search: '', category: '', sortBy: 'popular', verifiedOnly: false })}
                  className="mt-10 px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-xl"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {creators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm glass z-[110] border-l border-white/10 p-8 flex flex-col"
            >
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
                onClose={() => setShowMobileFilters(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

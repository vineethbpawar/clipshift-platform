"use client";

import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Users, Loader2, Navigation, Globe, Search, Filter, ShieldCheck } from "lucide-react";
import { type Creator } from "@/data/creators";

const MapView = dynamic(() => import("@/components/map/MapView").then(mod => mod.MapView), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl">
      <Loader2 className="animate-spin text-neon-blue mb-4" size={48} />
      <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Initializing Map</span>
    </div>
  )
});

export default function ExplorePage() {
  const [creators, setCreators] = useState<Partial<Creator>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const { data, error } = await supabase
          .from('creators')
          .select(`
            *,
            profiles(full_name, avatar_url, city, area)
          `);

        if (error) throw error;

        if (data) {
          setCreators(data.map((n) => {
            const typedN = n as unknown as { 
              id: string; 
              profiles: { full_name: string; avatar_url: string; area: string };
              location_lat: number;
              location_lng: number;
              category: string;
              specialization: string;
              rating: number;
              starting_price: number;
            };
            return {
              id: typedN.id,
              name: typedN.profiles?.full_name || "Unknown",
              image: typedN.profiles?.avatar_url,
              location: { lat: typedN.location_lat, lng: typedN.location_lng, area: typedN.profiles?.area },
              category: typedN.category,
              specialty: typedN.specialization ? [typedN.specialization] : [],
              rating: typedN.rating || 4.9,
              price: (typedN.starting_price || 499).toString()
            };
          }) as Partial<Creator>[]);
        }
      } catch (err: unknown) {
        console.error("Map fetch failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load creators";
        setError(errorMessage);
      }
    };

    fetchCreators();
  }, []);

  return (
    <PageWrapper>
      <div className="h-[100dvh] pt-20 flex flex-col relative overflow-hidden bg-black">
        {/* Map UI Overlay: Header */}
        <div className="absolute top-24 left-6 right-6 z-20 flex flex-col md:flex-row justify-between items-start gap-4 pointer-events-none">
          <div className="pointer-events-auto">
            <div className="glass p-6 rounded-[32px] border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                 <h1 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Live Discovery</h1>
               </div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                 Global <span className="text-neon-blue">Creators</span>
               </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
             <div className="glass px-6 py-4 rounded-2xl border-white/10 bg-black/60 backdrop-blur-xl flex items-center gap-3">
                <Users size={16} className="text-neon-purple" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{creators.length} Creators Active</span>
             </div>
             <button className="p-4 glass rounded-2xl border-white/10 bg-black/60 backdrop-blur-xl text-white hover:bg-white/5 transition-all">
                <Filter size={18} />
             </button>
          </div>
        </div>

        {/* Search Overlay */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-6 pointer-events-none">
           <div className="pointer-events-auto glass p-2 rounded-[40px] border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-2">
              <div className="p-4 rounded-full bg-neon-blue/10 text-neon-blue">
                 <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search city, area or creator name..."
                className="bg-transparent border-none outline-none text-sm text-white w-full px-4 italic placeholder:text-gray-600"
              />
              <button className="px-8 py-4 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-neon-blue hover:text-white transition-all">
                 Locate
              </button>
           </div>
        </div>

        {/* Map View */}
        <div className="flex-1 w-full relative z-10">
          {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl px-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
                <Globe size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter italic">Map sync failed</h2>
              <p className="text-gray-500 mb-10 uppercase tracking-widest text-[10px] font-bold max-w-xs leading-relaxed">
                Could not connect to the global creator database. Please check your connection.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neon-blue hover:text-white transition-all shadow-xl"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="w-full h-full grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
               <MapView creators={creators as Creator[]} />
            </div>
          )}
        </div>

        {/* Stats & Legend Overlay */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col gap-4 pointer-events-none">
           {[
             { label: "India", value: "Active", icon: Navigation },
             { label: "Global", value: "Coming Soon", icon: Globe },
             { label: "Elite", value: "Verified", icon: ShieldCheck }
           ].map((item, i) => (
             <div key={i} className="glass p-5 rounded-3xl border-white/5 bg-black/40 backdrop-blur-xl pointer-events-auto">
                <item.icon size={18} className="text-gray-500 mb-3" />
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{item.label}</p>
                <p className="text-[10px] text-white font-black uppercase tracking-tighter mt-0.5 italic">{item.value}</p>
             </div>
           ))}
        </div>
      </div>
    </PageWrapper>
  );
}

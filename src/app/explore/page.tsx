"use client";

import React, { useState, useEffect } from "react";
import { MapView } from "@/components/map/MapView";
import { LocationSearch } from "@/components/map/LocationSearch";
import { RadiusFilter } from "@/components/map/RadiusFilter";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Crosshair, Filter, List, MapPinOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function ExplorePage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<any[]>([]);
  const [radius, setRadius] = useState(20);
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0760, 72.8777]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setTimedOut(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('creators')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url,
              city,
              area,
              pincode
            )
          `);

        if (error) {
          console.error("Explore fetch error:", error);
          throw error;
        }
        
        if (data) {
          const mappedCreators = data.map(c => ({
            id: c.id,
            name: c.profiles?.full_name || "Unknown",
            category: c.category,
            image: c.profiles?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80",
            location: { 
              lat: c.location_lat || 19.0760, 
              lng: c.location_lng || 72.8777,
              city: c.profiles?.city,
              area: c.profiles?.area,
              pincode: c.profiles?.pincode
            },
            rating: c.rating
          }));
          setCreators(mappedCreators);
          setFilteredCreators(mappedCreators);
        }
      } catch (err) {
        console.error("Error fetching creators:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    const filtered = creators.filter(c => 
      c.location.city?.toLowerCase().includes(q) || 
      c.location.area?.toLowerCase().includes(q) || 
      c.location.pincode?.includes(q)
    );
    setFilteredCreators(filtered);
    
    if (filtered.length > 0) {
      setMapCenter([filtered[0].location.lat, filtered[0].location.lng]);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  return (
    <PageWrapper>
      <div className="h-screen w-full relative overflow-hidden bg-black">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <MapView creators={filteredCreators} center={mapCenter} />
        </div>

        {/* Loading Overlay */}
        {loading && !timedOut && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-neon-purple" size={40} />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Scanning Global Nodes...</span>
            </div>
          </div>
        )}

        {/* Timeout Overlay */}
        {loading && timedOut && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
            <div className="glass p-8 rounded-[40px] border-red-500/20 text-center max-w-sm">
              <h2 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Node Synchronized Error</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">The global discovery network is taking too long to respond. Please verify your connection.</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-neon-purple text-white rounded-full font-black uppercase text-xs tracking-widest shadow-lg"
              >
                Reconnect Node
              </button>
            </div>
          </div>
        )}

        {/* Empty State Overlay */}
        {!loading && filteredCreators.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-12 rounded-[40px] border-white/5 text-center max-w-sm pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <MapPinOff size={32} className="text-gray-500" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Dark Zone</h2>
              <p className="text-gray-500 text-sm mb-0">No creators in this area yet. Be the first to light up this sector.</p>
            </motion.div>
          </div>
        )}

        {/* Overlay UI - Top Bar */}
        <div className="absolute top-24 md:top-28 left-0 right-0 z-20 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-none">
          <div className="w-full md:max-w-sm pointer-events-auto">
            <LocationSearch onSearch={handleSearch} />
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 pointer-events-auto self-end md:self-auto">
            <button 
              onClick={handleLocate}
              className="p-3 md:p-4 glass border-white/10 rounded-full text-white hover:bg-neon-purple hover:text-white transition-all shadow-lg"
              title="Current Location"
            >
              <Crosshair className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 md:p-4 glass border-white/10 rounded-full transition-all shadow-lg ${showFilters ? "bg-neon-purple text-white" : "text-white"}`}
            >
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Overlay UI - Filters Pane */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-44 md:top-48 right-4 md:right-8 z-20 w-[calc(100%-2rem)] sm:w-64 space-y-4"
            >
              <RadiusFilter radius={radius} setRadius={setRadius} />
              
              <div className="glass border-white/5 rounded-2xl p-4 max-h-[40vh] flex flex-col overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">Found {filteredCreators.length} Creators</div>
                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {filteredCreators.length > 0 ? filteredCreators.map(c => (
                    <div key={c.id} className="text-xs text-white p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/5">
                      {c.name} • <span className="text-neon-blue">{c.location.area || 'Unknown'}</span>
                    </div>
                  )) : (
                    <div className="text-[10px] text-gray-600 uppercase font-black py-4 text-center">Empty Sector</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay UI - Bottom Info */}
        {!loading && creators.length > 0 && (
          <div className="absolute bottom-6 md:bottom-8 left-4 md:left-8 z-20 pointer-events-none">
            <div className="glass px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl border-white/5 flex items-center gap-3 md:gap-4">
              <div className="flex -space-x-2 md:-space-x-3">
                {creators.slice(0, 3).map(c => (
                  <img key={c.id} src={c.image} className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-black" alt="" />
                ))}
              </div>
              <div className="text-[10px] md:text-xs">
                <div className="text-white font-bold">{creators.length} Premium Creators</div>
                <div className="text-gray-500 hidden sm:block">Available in global nodes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

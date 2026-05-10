"use client";

import React, { useState, useEffect } from "react";
import { MapView } from "@/components/map/MapView";
import { LocationSearch } from "@/components/map/LocationSearch";
import { RadiusFilter } from "@/components/map/RadiusFilter";
import { creators, type Creator } from "@/data/creators";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Crosshair, Filter, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExplorePage() {
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>(creators);
  const [radius, setRadius] = useState(20);
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0760, 72.8777]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    const filtered = creators.filter(c => 
      c.location.city.toLowerCase().includes(q) || 
      c.location.area.toLowerCase().includes(q) || 
      c.location.pincode.includes(q)
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

        {/* Overlay UI - Top Bar */}
        <div className="absolute top-28 left-0 right-0 z-10 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-none">
          <LocationSearch onSearch={handleSearch} />
          
          <div className="flex items-center gap-3 pointer-events-auto">
            <button 
              onClick={handleLocate}
              className="p-4 glass border-white/10 rounded-full text-white hover:bg-neon-purple hover:text-white transition-all shadow-lg"
              title="Current Location"
            >
              <Crosshair size={20} />
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 glass border-white/10 rounded-full transition-all shadow-lg ${showFilters ? "bg-neon-purple text-white" : "text-white"}`}
            >
              <Filter size={20} />
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
              className="absolute top-48 right-8 z-10 w-64 space-y-4"
            >
              <RadiusFilter radius={radius} setRadius={setRadius} />
              
              <div className="glass border-white/5 rounded-2xl p-4">
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">Found {filteredCreators.length} Creators</div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredCreators.map(c => (
                    <div key={c.id} className="text-xs text-white p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/5">
                      {c.name} • <span className="text-neon-blue">{c.location.area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay UI - Bottom Info */}
        <div className="absolute bottom-8 left-8 z-10 pointer-events-none hidden md:block">
          <div className="glass px-6 py-4 rounded-3xl border-white/5 flex items-center gap-4">
            <div className="flex -space-x-3">
              {creators.slice(0, 3).map(c => (
                <img key={c.id} src={c.image} className="w-8 h-8 rounded-full border-2 border-black" alt="" />
              ))}
            </div>
            <div className="text-xs">
              <div className="text-white font-bold">85+ Top Rated Creators</div>
              <div className="text-gray-500">Available in your current area</div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

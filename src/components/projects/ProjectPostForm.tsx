"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingInput } from "../ui/FloatingInput";
import { NeonButton } from "../ui/NeonButton";
import { MapPin, Upload, Calendar, DollarSign, Users, Info } from "lucide-react";
import dynamic from "next/dynamic";

const ProjectLocationMap = dynamic(() => import("../map/projects/ProjectLocationMap"), { ssr: false });

export const ProjectPostForm = () => {
  const [category, setCategory] = useState("Wedding");
  const [radius, setRadius] = useState(20);
  const [locations, setLocations] = useState<any[]>([]);
  const [rateType, setRateType] = useState("Per Project");

  const categories = ["Wedding", "YouTube", "Reels", "Drone", "Corporate", "Events", "Fashion", "Gaming", "Podcast", "Shoot"];
  const isShoot = category === "Drone" || category === "Events" || category === "Shoot";

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Details */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Post a <span className="text-neon-purple">Project</span></h1>
            <p className="text-gray-400">Define your vision and connect with elite creators.</p>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl border-white/5">
              <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Project Identity</h4>
              <div className="space-y-4">
                <FloatingInput label="Project Title" placeholder="e.g. Urban Night Life Music Video" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-4">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-neon-purple transition-colors appearance-none"
                    >
                      {categories.map(cat => <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-4">Urgency</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-neon-purple transition-colors appearance-none">
                      <option className="bg-zinc-900">Standard</option>
                      <option className="bg-zinc-900">Urgent (48h)</option>
                      <option className="bg-zinc-900">High Priority</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isShoot && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass p-6 rounded-3xl border-white/5 overflow-hidden"
                >
                  <h4 className="text-[10px] text-neon-blue uppercase font-black tracking-widest mb-4">Rate & Payment Terms</h4>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <FloatingInput label="Offered Rate (₹)" type="number" />
                    <select 
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-neon-purple transition-colors appearance-none"
                    >
                      <option className="bg-zinc-900">Per Hour</option>
                      <option className="bg-zinc-900">Half Day</option>
                      <option className="bg-zinc-900">Full Day</option>
                      <option className="bg-zinc-900">Per Project</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-xs text-gray-300">Negotiable</span>
                    <input type="checkbox" className="accent-neon-purple w-4 h-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="glass p-6 rounded-3xl border-white/5">
              <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Project Brief</h4>
              <textarea 
                placeholder="Describe your creative requirements..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-purple transition-colors resize-none mb-4"
              />
              <div className="flex items-center gap-4 p-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-neon-purple/50 transition-colors cursor-pointer group">
                <Upload className="text-gray-500 group-hover:text-neon-purple transition-colors" />
                <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Upload Reference Videos / Footage</span>
              </div>
            </div>

            <NeonButton variant="purple" className="w-full py-5 text-sm tracking-[0.2em]">Deploy Project Request</NeonButton>
          </div>
        </div>

        {/* Right Column: Location & Mapping */}
        <div className="space-y-8">
          <div className="glass rounded-[40px] overflow-hidden border border-white/5 relative h-[600px] group">
            <ProjectLocationMap 
              locations={locations} 
              setLocations={setLocations} 
              radius={radius} 
            />
            
            {/* Map Controls Overlay */}
            <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none flex flex-col gap-4">
              <div className="glass p-4 rounded-2xl border-white/10 pointer-events-auto max-w-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Shoot Radius</span>
                  <span className="text-[10px] font-mono text-neon-purple">{radius}km</span>
                </div>
                <input 
                  type="range" 
                  min="5" max="100" 
                  value={radius} 
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                />
              </div>

              {locations.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-4 rounded-2xl border-white/10 pointer-events-auto"
                >
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={12} className="text-neon-blue" />
                    Target Locations ({locations.length})
                  </h5>
                  <div className="space-y-2">
                    {locations.map((loc, i) => (
                      <div key={i} className="text-[10px] text-gray-400 flex items-center justify-between">
                        <span>{loc.name}</span>
                        <span className="text-neon-purple font-mono">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Nearby Creators Badge */}
            <div className="absolute bottom-6 right-6 z-10">
              <div className="glass px-4 py-2 rounded-full border-neon-purple/30 flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Users size={14} className="text-neon-purple" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  ~12 Creators Nearby
                </span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 flex gap-4">
            <Info className="text-neon-blue shrink-0" size={20} />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              For shoot-based projects, only verified videographers within your selected radius will be notified. This ensures rapid response and local expertise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

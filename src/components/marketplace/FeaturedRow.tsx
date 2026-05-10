"use client";

import React from "react";
import { motion } from "framer-motion";
import { type Creator } from "@/data/creators";
import { Star, ShieldCheck } from "lucide-react";

export const FeaturedRow = ({ creators }: { creators: Creator[] }) => {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
          Featured <span className="text-neon-purple">Talent</span>
        </h2>
        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex gap-4">
          <span>Scroll to explore</span>
          <div className="flex gap-1">
            <div className="w-4 h-1 bg-neon-purple rounded-full" />
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="w-1 h-1 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
        {creators.map((creator) => (
          <motion.div
            key={creator.id}
            whileHover={{ scale: 1.02 }}
            className="flex-shrink-0 w-80 snap-start glass border-white/5 rounded-3xl overflow-hidden relative group"
          >
            <div className="aspect-video relative overflow-hidden">
              <img src={creator.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
              <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                Featured
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  {creator.name}
                  {creator.verified && <ShieldCheck size={16} className="text-neon-blue" />}
                </h3>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-white">{creator.rating}</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">{creator.category}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-xl font-black text-white">{creator.price}</div>
                <button className="text-[10px] font-black text-neon-purple uppercase tracking-[0.2em] hover:text-white transition-colors">
                  View Portfolio
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

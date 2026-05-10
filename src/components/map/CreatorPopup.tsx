"use client";

import React from "react";
import { Star, ShieldCheck, ArrowRight } from "lucide-react";
import { NeonButton } from "../ui/NeonButton";
import { type Creator } from "@/data/creators";

export const CreatorPopup = ({ creator }: { creator: Creator }) => {
  return (
    <div className="w-[260px] bg-transparent">
      <div className="p-0 m-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full border border-neon-purple/50 overflow-hidden shrink-0">
            <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1">
              {creator.name}
              <ShieldCheck size={14} className="text-neon-blue" />
            </h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{creator.category}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-white">{creator.rating}</span>
          </div>
          <div className="text-xs font-mono text-neon-purple font-bold">{creator.price}</div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {creator.specialty.slice(0, 2).map((s, i) => (
            <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
              {s}
            </span>
          ))}
        </div>

        <NeonButton variant="purple" size="sm" className="w-full text-[10px] py-2 group">
          Quick Hire
          <ArrowRight size={10} className="inline-block ml-1 group-hover:translate-x-0.5 transition-transform" />
        </NeonButton>
      </div>
    </div>
  );
};

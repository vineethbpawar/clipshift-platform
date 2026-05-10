"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Check } from "lucide-react";

interface PricingCardProps {
  level: string;
  price: string;
  features: string[];
  isTarget?: boolean;
  onSelect: () => void;
}

export const PricingCard = ({ level, price, features, isTarget, onSelect }: PricingCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className={`relative glass border-white/5 p-6 rounded-[32px] cursor-pointer transition-all duration-500 overflow-hidden group ${
        isTarget ? "ring-2 ring-neon-purple shadow-[0_0_30px_rgba(168,85,247,0.2)]" : "opacity-80 hover:opacity-100"
      }`}
    >
      {isTarget && (
        <div className="absolute top-0 right-0 px-4 py-1 bg-neon-purple text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl">
          Creator Tier
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2">{level}</h4>
        <div className="text-4xl font-black text-white">{price}</div>
        <div className="text-[8px] text-gray-600 uppercase font-bold tracking-widest mt-1">One-time Unlock</div>
      </div>

      <div className="space-y-3 mb-8">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isTarget ? "bg-neon-purple/20 text-neon-purple" : "bg-white/5 text-gray-600"}`}>
              <Check size={10} />
            </div>
            <span className="text-[10px] text-gray-400 font-bold">{f}</span>
          </div>
        ))}
      </div>

      <button className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        isTarget ? "bg-neon-purple text-white" : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white"
      }`}>
        Select Tier
      </button>

      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-neon-purple/5 blur-2xl rounded-full" />
    </motion.div>
  );
};

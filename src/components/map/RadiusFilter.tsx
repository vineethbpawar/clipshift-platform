"use client";

import React from "react";
import { motion } from "framer-motion";

export const RadiusFilter = ({ radius, setRadius }: { radius: number, setRadius: (r: number) => void }) => {
  const options = [5, 10, 20, 50, 100];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass border-white/5 rounded-2xl p-4 pointer-events-auto"
    >
      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-3">Discovery Radius</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setRadius(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              radius === opt 
                ? "bg-neon-purple text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {opt} km
          </button>
        ))}
      </div>
    </motion.div>
  );
};

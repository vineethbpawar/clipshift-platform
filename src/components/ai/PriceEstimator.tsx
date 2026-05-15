"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { DollarSign, Zap, TrendingUp, AlertCircle, Sparkles } from "lucide-react";

export const PriceEstimator = ({ projectType = "Cinematic Reel", duration = "60s" }: { projectType?: string, duration?: string }) => {
  const [range, setRange] = useState({ min: 15000, max: 25000 });
  const [marketAvg, setMarketAvg] = useState(18000);

  const springMin = useSpring(0, { mass: 1, stiffness: 60, damping: 20 });
  const springMax = useSpring(0, { mass: 1, stiffness: 60, damping: 20 });
  
  const [displayMin, setDisplayMin] = useState("0");
  const [displayMax, setDisplayMax] = useState("0");

  useEffect(() => {
    // Logic based on project type
    const base = projectType.includes("Reel") ? 15000 : 45000;
    const offset = 0;
    setRange({ min: base + offset, max: base + offset + 15000 });
    setMarketAvg(base + offset + 2000);
    
    springMin.set(base + offset);
    springMax.set(base + offset + 15000);

    const unMin = springMin.on("change", (v) => setDisplayMin(Math.floor(v).toLocaleString()));
    const unMax = springMax.on("change", (v) => setDisplayMax(Math.floor(v).toLocaleString()));

    return () => {
      unMin();
      unMax();
    };
  }, [projectType, duration, springMin, springMax]);

  return (
    <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-neon-purple" />
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">AI Price Optimization</h3>
        </div>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] font-black text-green-500 uppercase tracking-widest">
          Fair Price Node
        </div>
      </div>

      <div className="text-center mb-8">
        <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Recommended Budget Range</h4>
        <div className="text-4xl font-black text-white tracking-tighter flex items-center justify-center gap-3">
          <span className="text-neon-purple">₹</span>
          <span>{displayMin}</span>
          <span className="text-gray-700 mx-2">—</span>
          <span>{displayMax}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest">
          <span>Market Average Node</span>
          <span className="text-white">₹{marketAvg.toLocaleString()}</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "65%" }}
            className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
          />
          {/* Marker for market avg */}
          <div className="absolute left-[60%] top-0 bottom-0 w-1 bg-white/30 z-10" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
          <AlertCircle size={14} className="text-neon-blue" />
          <p className="text-[9px] text-gray-400 font-bold leading-relaxed">
            Estimates are based on 1.2k similar <span className="text-white uppercase">{projectType}</span> completions this month.
          </p>
        </div>
      </div>
    </div>
  );
};
